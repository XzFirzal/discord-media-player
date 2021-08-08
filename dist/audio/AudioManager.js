"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioManager = void 0;
const soundcloud_downloader_1 = __importDefault(require("soundcloud-downloader"));
const fs_1 = require("fs");
const AudioPlayerImpl_1 = require("./AudioPlayerImpl");
const path_1 = require("path");
const events_1 = require("events");
const child_process_1 = require("child_process");
const os_1 = require("os");
function initCache(dir) {
    if (!fs_1.existsSync(dir))
        fs_1.mkdirSync(dir);
}
function defaultCreateAudioPlayerType(manager) {
    const player = new AudioPlayerImpl_1.AudioPlayerImpl();
    player.setManager(manager);
    return player;
}
/**
 * The manager of the audio players
 */
class AudioManager extends events_1.EventEmitter {
    /**
     * @param param0 The options to create new audio player manager
     */
    constructor({ cache, cacheDir, youtubeOptions, soundcloudClient, createAudioPlayer }) {
        super();
        /**
         * @internal
         */
        this._players = new Map();
        this.cache = cache;
        this.youtube = youtubeOptions ?? {};
        this.soundcloud = soundcloudClient ?? soundcloud_downloader_1.default;
        this._createAudioPlayer = createAudioPlayer || defaultCreateAudioPlayerType;
        if (cache) {
            const path = cacheDir ?? os_1.tmpdir();
            initCache(path);
            cache.setPath(fs_1.mkdtempSync(path_1.join(path, "node-discord-media-player-")));
            const daemon = child_process_1.fork(require.resolve("../nodeDeleteDaemon"), { detached: true });
            daemon.send(process.pid);
            daemon.send(cache.path);
            daemon.unref();
        }
    }
    /**
     * Get player from list if exist, otherwise create new
     * @param connection The voice connection
     * @returns The audio player
     */
    getPlayer(connection) {
        const guildID = connection.joinConfig.guildId;
        let player = this._players.get(guildID);
        if (!player) {
            player = this._createAudioPlayer(this);
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
