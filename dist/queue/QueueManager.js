"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueManager = exports.VIDEO_URL = exports.PLAYLIST_URL = void 0;
const Track_1 = require("./Track");
const QueueHandler_1 = require("./QueueHandler");
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
const AudioManager_1 = require("../audio/AudioManager");
const validation_1 = require("../validation");
const youtube_scrapper_1 = require("youtube-scrapper");
/**
 * A RegExp instance to identify youtube playlist url
 */
exports.PLAYLIST_URL = /^(?:(?:http|https):\/\/)?(?:www\.)?youtube\.com\/playlist\?list=((?:PL|UU|LL|RD|OL)[\w-]{16,41})$/;
/**
 * A RegExp instance to identify youtube video url
 */
exports.VIDEO_URL = /^(?:(?:http|https):\/\/)?(?:youtu\.be\/|(?:(?:www|m)\.)?youtube\.com\/(?:watch\?v=|v\/|embed\/))([\w-]{11})$/;
/**
 * The manager of queue handler
 *
 * Example:
 * ```ts
 * import { QueueManager, CacheManagerImpl, youtubeMetadata, soundcloudMetadata } from "discord-media-player"
 * const manager = new QueueManager<youtubeMetadata | soundcloudMetadata>({
 *   //cache is optional
 *   cache: new CacheManagerImpl()
 * })
 * ...
 * ```
 */
class QueueManager extends tiny_typed_emitter_1.TypedEmitter {
    /**
     * @param manager The audio manager resolvable
     */
    constructor(manager, metadata) {
        super();
        /**
         * @internal
         */
        this._handlers = new Map();
        validation_1.QueueManagerValidation.validateAudioManager(manager);
        this.metadata = metadata;
        if (manager instanceof AudioManager_1.AudioManager)
            this.audioManager = manager;
        else
            this.audioManager = new AudioManager_1.AudioManager(manager);
        this.audioManager.on("audioStart", this.emit.bind(this, "audioStart"));
        this.audioManager.on("audioEnd", this.emit.bind(this, "audioEnd"));
        this.audioManager.on("audioError", this.emit.bind(this, "audioError"));
    }
    /**
     * Get queue handler from list if exist, otherwise create new
     * @param connection The voice connection
     * @returns The queue handler
     */
    getHandler(connection) {
        validation_1.QueueManagerValidation.validateConnection(connection);
        const guildID = connection.joinConfig.guildId;
        let handler = this._handlers.get(guildID);
        if (!handler) {
            const player = this.audioManager.getPlayer(connection);
            handler = new QueueHandler_1.QueueHandler(this, player);
            this._handlers.set(guildID, handler);
        }
        return handler;
    }
    /**
     * Delete queue handler from list
     * @param connection The voice connection
     * @returns false if failed or doesn't exist, true if deleted
     */
    deleteHandler(connection) {
        validation_1.QueueManagerValidation.validateConnection(connection);
        const guildID = connection.joinConfig.guildId;
        if (!this._handlers.has(guildID))
            return false;
        const success = this._handlers.delete(guildID);
        if (success)
            this.audioManager.deletePlayer(connection);
        return success;
    }
    /**
     * @internal
     */
    _deleteHandlerIfExist(guildID) {
        if (this._handlers.has(guildID))
            this._handlers.delete(guildID);
    }
    /**
     * Search for a youtube track
     * @param options The youtube search options
     * @returns The youtube search result
     */
    async youtubeSearch(options) {
        validation_1.QueueManagerValidation.validateYoutubeSearchOptions(options);
        const tracks = [];
        const type = exports.PLAYLIST_URL.test(options.query)
            ? "playlist"
            : exports.VIDEO_URL.test(options.query)
                ? "video"
                : "search";
        if (type === "video") {
            const videoID = exports.VIDEO_URL.exec(options.query)[1];
            const { details } = await youtube_scrapper_1.getVideoInfo(`https://www.youtube.com/watch?v=${videoID}`);
            tracks.push(new Track_1.Track({
                sourceType: 0,
                urlOrLocation: details.url,
                metadata: details
            }));
        }
        else if (type === "playlist") {
            const playlistID = exports.PLAYLIST_URL.exec(options.query)[1];
            const playlist = await youtube_scrapper_1.getPlaylistInfo(`https://www.youtube.com/playlist?list=${playlistID}`, { full: options.fullPlaylist ?? false });
            for (const video of playlist.tracks) {
                tracks.push(new Track_1.Track({
                    sourceType: 0,
                    urlOrLocation: video.url,
                    metadata: video
                }));
            }
        }
        else {
            const searchResult = await youtube_scrapper_1.search(options.query);
            for (const video of searchResult.videos) {
                tracks.push(new Track_1.Track({
                    sourceType: 0,
                    urlOrLocation: video.url,
                    metadata: video
                }));
            }
        }
        return { type, tracks };
    }
    /**
     * Search for a soundcloud track
     * @param options The soundcloud search options
     * @returns The soundcloud search result
     */
    async soundcloudSearch(options) {
        validation_1.QueueManagerValidation.validateSoundcloudSearchOptions(options);
        const { soundcloud } = this.audioManager;
        const tracks = [];
        const type = soundcloud.isPlaylistURL(options.query)
            ? "set"
            : soundcloud.isValidUrl(options.query)
                ? "track"
                : "search";
        if (type === "track") {
            const track = await soundcloud.getInfo(options.query);
            tracks.push(new Track_1.Track({
                sourceType: 1,
                urlOrLocation: track.permalink_url,
                metadata: track
            }));
        }
        else if (type === "set") {
            const set = await soundcloud.getSetInfo(options.query);
            for (const track of set.tracks) {
                if (tracks.length >= options.setLimit)
                    break;
                tracks.push(new Track_1.Track({
                    sourceType: 1,
                    urlOrLocation: track.permalink_url,
                    metadata: track
                }));
            }
        }
        else {
            const searchResult = await soundcloud.search({
                query: options.query,
                limit: options.searchLimit ?? 1,
                offset: options.searchOffset ?? 0
            });
            // eslint-disable-next-line no-inner-declarations
            async function getNext(searchResponse) {
                for (const track of searchResponse.collection) {
                    if (tracks.length >= options.searchLimit)
                        break;
                    tracks.push(new Track_1.Track({
                        sourceType: 1,
                        urlOrLocation: track.permalink_url,
                        metadata: track
                    }));
                }
                if (tracks.length < options.searchLimit && searchResponse.next_href)
                    await getNext(await soundcloud.search({
                        nextHref: searchResponse.next_href
                    }));
            }
            await getNext(searchResult);
        }
        return { type, tracks };
    }
}
exports.QueueManager = QueueManager;
/**
 * Emitted whenever an audio is started playing
 *
 * Listener must implement {@link AudioManagerEvents.audioStart | AudioStartCallback}
 * @event
 */
QueueManager.AUDIO_START = "audioStart";
/**
 * Emitted whenever an audio is ended after playing
 *
 * Listener must implement {@link AudioManagerEvents.audioEnd | AudioEndCallback}
 * @event
 */
QueueManager.AUDIO_END = "audioEnd";
/**
 * Emitted whenever an error is thrown while getting audio source before playing
 *
 * Listener must implement {@link AudioManagerEvents.audioError | AudioErrorCallback}
 * @event
 */
QueueManager.AUDIO_ERROR = "audioError";
/**
 * Emitted whenever a queue is starting to play audio
 *
 * Listener must implement {@link QueueManagerEvents.queueStart | QueueStartCallback}
 * @event
 */
QueueManager.QUEUE_START = "queueStart";
/**
 * Emitted whenever a queue is ended
 *
 * Listener must implement {@link QueueManagerEvents.queueEnd | QueueEndCallback}
 * @event
 */
QueueManager.QUEUE_END = "queueEnd";
