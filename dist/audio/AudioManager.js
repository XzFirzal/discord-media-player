"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioManager = void 0;
const soundcloud_downloader_1 = __importDefault(require("soundcloud-downloader"));
const validation_1 = require("../validation");
const fs_1 = require("fs");
const AudioPlayerImpl_1 = require("./AudioPlayerImpl");
const tiny_typed_emitter_1 = require("tiny-typed-emitter");
const path_1 = require("path");
const os_1 = require("os");
function initCache(dir) {
    if (!fs_1.existsSync(dir))
        fs_1.mkdirSync(dir);
}
function defaultCreateAudioPlayerType() {
    return new AudioPlayerImpl_1.AudioPlayerImpl();
}
/**
 * The manager of the audio players
 */
class AudioManager extends tiny_typed_emitter_1.TypedEmitter {
    /**
     * @param options The options to create new audio player manager
     */
    constructor(options) {
        super();
        /**
         * @internal
         */
        this._players = new Map();
        validation_1.AudioManagerValidation.validateOptions(options);
        const { cache, cacheDir, cacheTimeout, playTimeout, youtubeOptions, soundcloudClient, createAudioPlayer } = options;
        this.cache = cache;
        this.playTimeout = playTimeout ?? 7 * 1000;
        this.youtube = youtubeOptions ?? {};
        this.soundcloud = soundcloudClient ?? soundcloud_downloader_1.default;
        this._createAudioPlayer = createAudioPlayer || defaultCreateAudioPlayerType;
        if (cache) {
            const path = cacheDir ?? os_1.tmpdir();
            const timeout = cacheTimeout ?? 1000 * 60 * 10;
            initCache(path);
            cache.setTimeout(timeout);
            cache.setPath(fs_1.mkdtempSync(path_1.join(path, "node-discord-media-player-")));
        }
    }
    /**
     * Get player from list if exist, otherwise create new
     * @param connection The voice connection
     * @returns The audio player
     */
    getPlayer(connection) {
        validation_1.AudioManagerValidation.validateConnection(connection);
        const guildID = connection.joinConfig.guildId;
        let player = this._players.get(guildID);
        if (!player) {
            player = this._createAudioPlayer();
            validation_1.AudioManagerValidation.validatePlayer(player);
            player.setManager(this);
            player.link(connection);
            this._players.set(guildID, player);
        }
        return player;
    }
    /**
     * Delete player from list and unlink it
     * @param connection The voice connection
     * @returns false if failed or doesn't exist, true if deleted
     */
    deletePlayer(connection) {
        validation_1.AudioManagerValidation.validateConnection(connection);
        const guildID = connection.joinConfig.guildId;
        if (!this._players.has(guildID))
            return false;
        const player = this._players.get(guildID);
        const success = this._players.delete(guildID);
        if (success)
            player.unlink();
        return success;
    }
    /**
     * @internal
     */
    _deletePlayerIfExist(guildID) {
        if (this._players.has(guildID))
            this._players.delete(guildID);
    }
}
exports.AudioManager = AudioManager;
/**
 * Emitted whenever an audio is started playing
 *
 * Listener must implement {@link AudioManagerEvents.audioStart | AudioStartCallback}
 * @event
 */
AudioManager.AUDIO_START = "audioStart";
/**
 * Emitted whenever an audio is ended after playing
 *
 * Listener must implement {@link AudioManagerEvents.audioEnd | AudioEndCallback}
 * @event
 */
AudioManager.AUDIO_END = "audioEnd";
/**
 * Emitted whenever an error is thrown while getting audio source before playing
 *
 * Listener must implement {@link AudioManagerEvents.audioError | AudioErrorCallback}
 * @event
 */
AudioManager.AUDIO_ERROR = "audioError";
