"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueManager = void 0;
const youtube_sr_1 = __importDefault(require("youtube-sr"));
const Track_1 = require("./Track");
const QueueHandler_1 = require("./QueueHandler");
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
const AudioManager_1 = require("../audio/AudioManager");
const validation_1 = require("../validation");
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
    constructor(manager) {
        super();
        /**
         * @internal
         */
        this._handlers = new Map();
        validation_1.QueueManagerValidation.validateAudioManager(manager);
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
        const type = youtube_sr_1.default.Regex.VIDEO_URL.test(options.query)
            ? "video"
            : youtube_sr_1.default.Regex.PLAYLIST_URL.test(options.query)
                ? "playlist"
                : "search";
        if (type === "video") {
            const video = await youtube_sr_1.default.getVideo(options.query);
            tracks.push(new Track_1.Track({
                sourceType: 0,
                urlOrLocation: video.url,
                metadata: video
            }));
        }
        else if (type === "playlist") {
            const limit = options.playlistLimit ?? 100;
            const playlist = await youtube_sr_1.default.getPlaylist(options.query, { limit });
            await playlist.fetch();
            for (const video of playlist) {
                if (tracks.length >= limit)
                    break;
                tracks.push(new Track_1.Track({
                    sourceType: 0,
                    urlOrLocation: video.url,
                    metadata: video
                }));
            }
        }
        else {
            const searchResult = await youtube_sr_1.default.search(options.query, {
                limit: options.searchLimit ?? 1,
                type: "video",
                safeSearch: true
            });
            for (const video of searchResult) {
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
