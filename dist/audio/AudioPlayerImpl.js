"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPlayerImpl = void 0;
const prism_media_1 = __importDefault(require("prism-media"));
const noop_1 = require("../util/noop");
const Skipper_1 = require("../util/Skipper");
const Resource_1 = require("../util/Resource");
const ErrorCode_1 = require("../util/ErrorCode");
const CacheWriter_1 = require("../cache/CacheWriter");
const downloadMedia_1 = require("../soundcloudUtil/downloadMedia");
const voice_1 = require("@discordjs/voice");
const validation_1 = require("../validation");
const ytdl_core_1 = require("ytdl-core");
const stream_1 = require("stream");
const promises_1 = require("fs/promises");
const fs_1 = require("fs");
const events_1 = require("events");
const FFMPEG_ARGS = [
    "-f",
    "s16le",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-vn"
];
const FILTER_FFMPEG_ARGS = [
    "-f",
    "s16le",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-i",
    "-",
    "-acodec",
    "pcm_s16le",
    "-f",
    "s16le",
    "-ar",
    "48000",
    "-ac",
    "2",
    "-af"
];
/**
 * The default implementation of {@link AudioPlayer | AudioPlayer}
 */
class AudioPlayerImpl extends events_1.EventEmitter {
    /**
     * @internal
     */
    constructor() {
        super();
        /**
         * @internal
         */
        this.manager = null;
        /**
         * @internal
         */
        this._playResourceOnEnd = false;
        /**
         * @internal
         */
        this._disconnected = false;
        /**
         * @internal
         */
        this._aborting = false;
        /**
         * @internal
         */
        this._stopping = false;
        /**
         * @internal
         */
        this._playing = false;
        /**
         * @internal
         */
        this._looping = false;
        /**
         * @internal
         */
        this._volume = 1;
        /**
         * @internal
         */
        this._player = new voice_1.AudioPlayer();
        this._player.on("stateChange", this._onAudioChange.bind(this));
    }
    /**
     * @internal
     */
    get guildID() {
        return this._connection?.joinConfig.guildId;
    }
    /**
     * @internal
     */
    get status() {
        return this._player.state.status;
    }
    /**
     * @internal
     */
    get playing() {
        return this._playing;
    }
    /**
     * @internal
     */
    setManager(manager) {
        validation_1.AudioPlayerValidation.validateManager(manager);
        this.manager = manager;
    }
    /**
     * @internal
     */
    link(connection) {
        validation_1.AudioPlayerValidation.validateConnection(connection);
        this._checkNotLinked();
        connection.subscribe(this._player);
        this._connection = connection;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        function onConnectionChange(oldState, newState) {
            if (oldState.status !== voice_1.VoiceConnectionStatus.Destroyed && newState.status === voice_1.VoiceConnectionStatus.Destroyed) {
                connection.off("stateChange", onConnectionChange);
                self.manager._deletePlayerIfExist(self.guildID);
                const subscription = self._connection.state.subscription;
                subscription?.unsubscribe();
                if (self._playing) {
                    if (self._resource.player === self && self.manager.cache && !self._resource.isLive)
                        self._resource.audio.unpipe();
                    self._disconnected = true;
                    self._player.stop();
                }
                self.emit("unlink");
                self._connection = null;
                self._cleanup();
            }
            else if (oldState.subscription && !newState.subscription) {
                connection.off("stateChange", onConnectionChange);
            }
        }
        connection.on("stateChange", onConnectionChange);
    }
    /**
     * @internal
     */
    unlink() {
        this._checkLinked();
        const subscription = this._connection.state.subscription;
        subscription?.unsubscribe();
        if (this._playing) {
            if (this._resource.player === this && this.manager.cache && !this._resource.isLive)
                this._resource.audio.unpipe();
            this._disconnected = true;
            this._player.stop();
        }
        this.emit("unlink");
        this._connection = null;
        this._cleanup();
    }
    /**
     * @internal
     */
    setFilter(filter) {
        validation_1.AudioPlayerValidation.validateFilters(filter);
        if (!filter || !Object.keys(filter).length)
            this._filters = null;
        else
            this._filters = filter;
    }
    /**
     * @internal
     */
    setVolume(volume) {
        validation_1.AudioPlayerValidation.validateVolume(volume);
        this._checkPlaying();
        this._volume = volume;
        const audioResource = this._player.state.resource;
        if (audioResource)
            audioResource.volume.setVolume(this._volume);
    }
    /**
     * @internal
     */
    stop() {
        this._checkPlaying();
        if (this._resource.player === this && this.manager.cache && !this._resource.isLive)
            this._resource.audio.unpipe();
        this._stopping = true;
        const stopped = this._player.stop();
        this._stopping = false;
        if (!stopped) {
            if (this._resource.player === this)
                this._resource.player = null;
            this._cleanup();
        }
        return stopped;
    }
    /**
     * @internal
     */
    loop() {
        this._checkPlaying();
        this._looping = !this._looping;
        return this._looping;
    }
    /**
     * @internal
     */
    pause(pauseOrUnpause) {
        this._checkPlaying();
        if ((typeof pauseOrUnpause === "boolean" && pauseOrUnpause === false) ||
            ([voice_1.AudioPlayerStatus.Paused].includes(this.status) && pauseOrUnpause !== true)) {
            this._player.unpause();
            return false;
        }
        return this._player.pause();
    }
    /**
     * @internal
     */
    filter() {
        this._checkPlaying();
        const player = this._resource.player;
        this._abort();
        const audioResource = this._createAudioResource();
        if (player !== this && !this._resource.allCached)
            this._playResourceOnEnd = true;
        if (player === this)
            this._resource.player = this;
        this._player.play(audioResource);
        this._audio.pipe(audioResource.metadata);
    }
    /**
     * @internal
     */
    async seek(seconds) {
        validation_1.AudioPlayerValidation.validateSeconds(seconds);
        this._checkPlaying();
        if (this._resource.isLive)
            throw new Error("Livestream cannot be seekened");
        if (seconds > this._resource.cachedSecond && this._resource.allCached) {
            this.stop();
            return;
        }
        if (seconds === this._resource.cachedSecond) {
            if (this._resource.player === this)
                return;
            this._playResourceOnEnd = true;
            this._player.stop();
            return;
        }
        const player = this._resource.player;
        this._abort();
        if (seconds < this._resource.cachedSecond && !this.manager.cache)
            await this._getResource(this._urlOrLocation, this._sourceType);
        if (seconds > this._resource.cachedSecond) {
            const skipper = new Skipper_1.Skipper(seconds - this._resource.cachedSecond, this._resource.cacheWriter);
            if (player && player !== this) {
                this._audio.destroy();
                player._switchCache();
            }
            this._resource.cacheWriter.pipe(skipper);
            await new Promise((res) => skipper.once("close", res));
            this._playResource();
        }
        else
            this._playCache(seconds);
    }
    /**
     * @internal
     */
    async play(urlOrLocation, sourceType) {
        validation_1.AudioPlayerValidation.validateUrlOrLocation(urlOrLocation);
        validation_1.AudioPlayerValidation.validateSourceType(sourceType);
        this._checkNotPlaying();
        await this._getResource(urlOrLocation, sourceType);
        if (!this._resource) {
            this.emit("end");
            return;
        }
        this._playing = true;
        this._sourceType = sourceType;
        this._urlOrLocation = urlOrLocation;
        if (this._resource.player === this)
            this._playResource();
        else
            this._playCache();
        this.manager.emit("audioStart", this.guildID, urlOrLocation);
    }
    /**
     * @internal
     */
    _playResource() {
        const audioResource = this._createAudioResource();
        this._resource.player = this;
        this._audio = this._resource.audio;
        this._player.play(audioResource);
        this._audio.pipe(audioResource.metadata);
    }
    /**
     * @internal
     */
    _playCache(startOnSeconds = 0) {
        const audioResource = this._createAudioResource();
        const cacheStream = this._resource.cache.read(this._resource.identifier, startOnSeconds);
        this._audio = cacheStream;
        this._player.play(audioResource);
        this._audio.pipe(audioResource.metadata);
        if (!this._resource.allCached)
            this._playResourceOnEnd = true;
    }
    /**
     * @internal
     */
    _createAudioResource() {
        const streams = [new prism_media_1.default.VolumeTransformer({
                type: "s16le",
                volume: this._volume
            }), new prism_media_1.default.opus.Encoder({
                rate: 48000,
                channels: 2,
                frameSize: 960
            })];
        if (this._filters) {
            const filters = [];
            Object.entries(this._filters).forEach((filter) => {
                if (!filter[1].length) {
                    filters.push(filter[0]);
                    return;
                }
                filters.push(filter.join("="));
            });
            streams.unshift(new prism_media_1.default.FFmpeg({ args: [...FILTER_FFMPEG_ARGS, filters.join(",")] }));
        }
        //Avoid null on _readableState.awaitDrainWriters
        streams.unshift(new stream_1.PassThrough());
        return new voice_1.AudioResource([], streams, streams[0], 0);
    }
    /**
     * @internal
     */
    _abort() {
        this._audio.unpipe();
        this._aborting = true;
        this._player.stop();
        this._aborting = false;
    }
    /**
     * @internal
     */
    _checkNotLinked() {
        if (this._connection)
            throw new validation_1.PlayerError(validation_1.ErrorMessages.PlayerAlreadyLinked);
    }
    /**
     * @internal
     */
    _checkLinked() {
        if (!this._connection)
            throw new validation_1.PlayerError(validation_1.ErrorMessages.PlayerNotLinked);
    }
    /**
     * @internal
     */
    _checkNotPlaying() {
        this._checkLinked();
        if (this._playing)
            throw new validation_1.PlayerError(validation_1.ErrorMessages.PlayerAlreadyPlaying);
    }
    /**
     * @internal
     */
    _checkPlaying() {
        this._checkLinked();
        if (!this._playing)
            throw new validation_1.PlayerError(validation_1.ErrorMessages.PlayerNotPlaying);
    }
    /**
     * @internal
     */
    async _getResource(urlOrLocation, sourceType) {
        switch (sourceType) {
            case 0:
                await this._getYoutubeResource(urlOrLocation);
                break;
            case 1:
                await this._getSoundcloudResource(urlOrLocation);
                break;
            case 2:
                await this._getLocalResource(urlOrLocation);
                break;
            default:
                throw new validation_1.PlayerError(validation_1.ErrorMessages.NotValidSourceType(sourceType));
        }
    }
    /**
     * @internal
     */
    async _getYoutubeResource(url) {
        const identifier = ytdl_core_1.getVideoID(url);
        if (this.manager.cache?.youtube.hasCache(identifier)) {
            this._resource = await this.manager.cache.youtube.getResource(identifier);
            return;
        }
        function getOpusFormat(format) {
            return format.codecs === "opus" &&
                format.container === "webm" &&
                format.audioSampleRate === "48000";
        }
        function getOtherFormat(sourceFormats, isLive) {
            function noVideo(format) {
                return !format.hasVideo;
            }
            let getFormat = (format) => format.hasAudio;
            if (isLive)
                getFormat = (format) => format.hasAudio && format.isHLS;
            const formats = sourceFormats.filter(getFormat);
            const filteredFormat = formats.find(noVideo);
            return filteredFormat || formats[0];
        }
        const options = { highWaterMark: 1 << 22, ...this.manager.youtube };
        let info = this._info;
        if (!info)
            info = await ytdl_core_1.getInfo(url, options);
        const playability = info.player_response?.playabilityStatus;
        if (!playability) {
            this.manager.emit("audioError", this.guildID, url, ErrorCode_1.ErrorCode.youtubeNoPlayerResponse);
            return;
        }
        else if (["UNPLAYABLE", "LOGIN_REQUIRED"].includes(playability.status)) {
            let errCode;
            switch (playability.status) {
                case "UNPLAYABLE":
                    errCode = ErrorCode_1.ErrorCode.youtubeUnplayable;
                    break;
                case "LOGIN_REQUIRED":
                    errCode = ErrorCode_1.ErrorCode.youtubeLoginRequired;
            }
            this.manager.emit("audioError", this.guildID, url, errCode);
            return;
        }
        if (!this.manager.cache && !info.videoDetails.isLiveContent)
            this._info = info;
        async function onPipeAndUnpipe(resource) {
            const commander = new events_1.EventEmitter();
            let contentLength = 0, downloaded = 0;
            await new Promise((resolve) => resource.source.once("pipe", resolve));
            resource.source.on("progress", (_, audioDownloaded, audioLength) => {
                downloaded = audioDownloaded;
                contentLength = audioLength;
            });
            resource.source.on("unpipe", async () => {
                if (downloaded >= contentLength)
                    return;
                resource.autoPaused = true;
                setImmediate(commander.emit.bind(commander, "unpipe"));
            });
            resource.source.on("pipe", async () => {
                await new Promise((resolve) => commander.once("unpipe", resolve));
                if (!resource.source.readable || !resource.source.readableFlowing)
                    await new Promise((resolve) => resource.source.once("readable", resolve));
                resource.autoPaused = false;
            });
        }
        let format = info.formats.find(getOpusFormat);
        const canDemux = format && !info.videoDetails.isLiveContent;
        if (canDemux) {
            options.format = format;
            const resource = this._resource = new Resource_1.Resource({
                identifier,
                player: this,
                source: ytdl_core_1.downloadFromInfo(info, options),
                demuxer: new prism_media_1.default.opus.WebmDemuxer(),
                decoder: new prism_media_1.default.opus.Decoder({
                    rate: 48000,
                    channels: 2,
                    frameSize: 960
                }),
                cacheWriter: new CacheWriter_1.CacheWriter(),
                cache: this.manager.cache?.youtube
            });
            stream_1.pipeline(resource.source, resource.demuxer, resource.decoder, resource.cacheWriter, noop_1.noop);
            onPipeAndUnpipe(resource);
            resource.cacheWriter.once("close", () => {
                resource.source.destroy();
                resource.demuxer.destroy();
                resource.decoder.destroy();
            });
            return;
        }
        format = getOtherFormat(info.formats, info.videoDetails.isLiveContent);
        if (!format) {
            this.manager.emit("audioError", this.guildID, url, ErrorCode_1.ErrorCode.noFormatOrMedia);
            return;
        }
        options.format = format;
        const resource = this._resource = new Resource_1.Resource({
            identifier,
            player: this,
            source: ytdl_core_1.downloadFromInfo(info, options),
            decoder: new prism_media_1.default.FFmpeg({ args: FFMPEG_ARGS }),
            cacheWriter: info.videoDetails.isLiveContent ? undefined : new CacheWriter_1.CacheWriter(),
            cache: info.videoDetails.isLiveContent ? undefined : this.manager.cache?.youtube
        });
        const lines = [resource.source, resource.decoder];
        if (!resource.isLive)
            lines.push(resource.cacheWriter);
        stream_1.pipeline(lines, noop_1.noop);
        onPipeAndUnpipe(resource);
        resource.audio.once("close", () => lines.forEach((line) => {
            if (!line.destroyed)
                line.destroy();
        }));
    }
    /**
     * @internal
     */
    async _getSoundcloudResource(url) {
        function getOpusMedia(media) {
            return media.find(({ format }) => {
                return format.mime_type === "audio/ogg; codecs=\"opus\"";
            });
        }
        let info = this._info;
        if (!info)
            info = await this.manager.soundcloud.getInfo(url);
        if (!info.media) {
            this.manager.emit("audioError", this.guildID, url, ErrorCode_1.ErrorCode.noFormatOrMedia);
            return;
        }
        if (!this.manager.cache)
            this._info = info;
        const identifier = String(info.id);
        if (this.manager.cache?.soundcloud.hasCache(identifier)) {
            this._resource = await this.manager.cache.soundcloud.getResource(identifier);
            return;
        }
        let transcoding = getOpusMedia(info.media.transcodings);
        if (transcoding) {
            const resource = this._resource = new Resource_1.Resource({
                identifier,
                player: this,
                source: await downloadMedia_1.downloadMedia(transcoding, await this.manager.soundcloud.getClientID(), this.manager.soundcloud.axios),
                demuxer: new prism_media_1.default.opus.OggDemuxer(),
                decoder: new prism_media_1.default.opus.Decoder({
                    rate: 48000,
                    channels: 2,
                    frameSize: 960
                }),
                cacheWriter: new CacheWriter_1.CacheWriter(),
                cache: this.manager.cache?.soundcloud
            });
            stream_1.pipeline(resource.source, resource.demuxer, resource.decoder, resource.cacheWriter, noop_1.noop);
            resource.cacheWriter.once("close", () => {
                resource.source.destroy();
                resource.demuxer.destroy();
                resource.decoder.destroy();
            });
            return;
        }
        transcoding = info.media.transcodings[0];
        if (!transcoding) {
            this.manager.emit("audioError", this.guildID, url, ErrorCode_1.ErrorCode.noFormatOrMedia);
            return;
        }
        const resource = this._resource = new Resource_1.Resource({
            identifier,
            player: this,
            source: await downloadMedia_1.downloadMedia(transcoding, await this.manager.soundcloud.getClientID(), this.manager.soundcloud.axios),
            decoder: new prism_media_1.default.FFmpeg({ args: FFMPEG_ARGS }),
            cacheWriter: new CacheWriter_1.CacheWriter(),
            cache: this.manager.cache?.soundcloud
        });
        stream_1.pipeline(resource.source, resource.decoder, resource.cacheWriter, noop_1.noop);
        resource.cacheWriter.once("close", () => {
            resource.source.destroy();
            resource.decoder.destroy();
        });
    }
    /**
     * @internal
     */
    async _getLocalResource(location) {
        let fileHandle;
        try {
            fileHandle = await promises_1.open(location, "r");
        }
        catch {
            this.manager.emit("audioError", this.guildID, location, ErrorCode_1.ErrorCode.cannotOpenFile);
            return;
        }
        const identifier = await fileHandle.stat({ bigint: true }).then((stat) => String(stat.ino));
        await fileHandle.close();
        if (this.manager.cache?.local.hasCache(identifier)) {
            this._resource = await this.manager.cache.local.getResource(identifier);
            return;
        }
        const { stream, type } = await voice_1.demuxProbe(fs_1.createReadStream(location));
        const resource = this._resource = new Resource_1.Resource({
            identifier,
            player: this,
            source: stream,
            demuxer: type === voice_1.StreamType.WebmOpus
                ? new prism_media_1.default.opus.WebmDemuxer()
                : type === voice_1.StreamType.OggOpus
                    ? new prism_media_1.default.opus.OggDemuxer()
                    : undefined,
            decoder: [voice_1.StreamType.WebmOpus, voice_1.StreamType.OggOpus].includes(type)
                ? new prism_media_1.default.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 })
                : new prism_media_1.default.FFmpeg({ args: FFMPEG_ARGS }),
            cacheWriter: new CacheWriter_1.CacheWriter(),
            cache: this.manager.cache?.local
        });
        if ([voice_1.StreamType.WebmOpus, voice_1.StreamType.OggOpus].includes(type))
            stream_1.pipeline(resource.source, resource.demuxer, resource.decoder, resource.cacheWriter, noop_1.noop);
        else
            stream_1.pipeline(resource.source, resource.decoder, resource.cacheWriter, noop_1.noop);
        resource.cacheWriter.once("close", () => {
            resource.source.destroy();
            resource.decoder.destroy();
        });
    }
    /**
     * @internal
     */
    async _onAudioChange(oldState, newState) {
        const paused = [voice_1.AudioPlayerStatus.Paused, voice_1.AudioPlayerStatus.AutoPaused];
        if (!paused.includes(oldState.status) && paused.includes(newState.status))
            this.emit("pause");
        else if (paused.includes(oldState.status) && !paused.includes(newState.status))
            this.emit("unpause");
        if (oldState.status === voice_1.AudioPlayerStatus.Paused && newState.status === voice_1.AudioPlayerStatus.Playing && this._switchToCache) {
            this._playCache(this._switchToCache);
            this._switchToCache = 0;
        }
        else if (oldState.status !== voice_1.AudioPlayerStatus.Idle && !newState.resource) {
            if (!(this._aborting || this._stopping) && this._playResourceOnEnd && !this._resource.allCached) {
                this._playResourceOnEnd = false;
                if (this._resource.player && this._resource.player !== this)
                    this._resource.player._switchCache();
                this._playResource();
                return;
            }
            if (this._resource.player === this) {
                if (!this.manager.cache && !this._resource.cacheWriter.destroyed)
                    this._resource.cacheWriter.read();
                this._resource.player = null;
            }
            else
                this._audio.destroy();
            if (!this._aborting) {
                this._playing = false;
                this._playResourceOnEnd = false;
                if (!this.manager.cache || this._resource.isLive) {
                    this._resource.audio.destroy();
                    if (this._resource.isLive)
                        this._resource.audio.emit("close");
                }
                if (!this._disconnected) {
                    if (this._resource.isLive) {
                        const stopping = this._stopping;
                        await this._getYoutubeResource(this._urlOrLocation);
                        if (this._looping || (this._resource.isLive && !stopping)) {
                            if (this._looping && !(this._resource.isLive && !stopping)) {
                                this.emit("end");
                                this.manager.emit("audioStart", this.guildID, this._urlOrLocation);
                                this.manager.emit("audioEnd", this.guildID, this._urlOrLocation);
                            }
                            this._playing = true;
                            this._playResource();
                            return;
                        }
                    }
                    else if (this._looping) {
                        this.emit("end");
                        this.manager.emit("audioEnd", this.guildID, this._urlOrLocation);
                        if (this.manager.cache) {
                            if (this._resource.cacheWriter.destroyed && !this._resource.allCached) {
                                this.manager.emit("audioError", this.guildID, this._urlOrLocation, ErrorCode_1.ErrorCode.noResource);
                                this._cleanup();
                                this.emit("end");
                                return;
                            }
                            this._playCache();
                        }
                        else {
                            await this._getResource(this._urlOrLocation, this._sourceType);
                            if (!this._resource) {
                                this._cleanup();
                                return;
                            }
                            this._playResource();
                        }
                        this._playing = true;
                        this.manager.emit("audioStart", this.guildID, this._urlOrLocation);
                        return;
                    }
                }
                this.emit("end");
                this.manager.emit("audioEnd", this.guildID, this._urlOrLocation);
                this._cleanup();
            }
            else
                this._playResourceOnEnd = false;
        }
    }
    /**
     * @internal
     */
    _cleanup() {
        this._info = null;
        this._audio = null;
        this._resource = null;
        this._sourceType = null;
        this._urlOrLocation = null;
        this._looping = false;
        this._disconnected = false;
        this._playResourceOnEnd = false;
    }
    /**
     * @internal
     */
    _switchCache() {
        const isPaused = this.status === voice_1.AudioPlayerStatus.Paused;
        this._audio.unpipe();
        const seconds = this._resource.cachedSecond;
        setImmediate(() => {
            if (!isPaused)
                this._playCache(seconds);
            else
                this._switchToCache = seconds;
        });
    }
}
exports.AudioPlayerImpl = AudioPlayerImpl;
/**
 * Emitted when player is unlinked from connection
 * @event
 */
AudioPlayerImpl.UNLINK = "unlink";
/**
 * Emitted whenever player is paused
 * @event
 */
AudioPlayerImpl.PAUSE = "pause";
/**
 * Emitted whenever player is unpaused
 * @event
 */
AudioPlayerImpl.UNPAUSE = "unpause";
/**
 * Emitted whenever an audio is ended
 * @event
 */
AudioPlayerImpl.END = "end";
