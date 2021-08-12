"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
const voice_1 = require("@discordjs/voice");
/**
 * The audio resource instance
 */
class Resource {
    /**
     * @param param0 The options to create audio resource
     */
    constructor({ player, identifier, decoder, source, cache, demuxer, cacheWriter }) {
        /**
         * The audio cached in seconds
         */
        this.cachedSecond = 0;
        /**
         * true if all audio is cached, otherwise false
         */
        this.allCached = false;
        /**
         * If audio source is from youtube, it will auto paused when ytdl-core getting next chunk
         */
        this._autoPaused = false;
        this.player = player;
        this.identifier = identifier;
        this.cache = cache;
        this.source = source;
        this.demuxer = demuxer;
        this.decoder = decoder;
        if (cacheWriter) {
            this.audio = cacheWriter;
            this.cacheWriter = cacheWriter;
            cacheWriter.setResource(this);
        }
        else
            this.audio = this.decoder;
        this.isLive = !cacheWriter;
    }
    set player(player) {
        this._player = player;
        setImmediate(() => {
            if (this.autoPaused && ![voice_1.AudioPlayerStatus.Paused, voice_1.AudioPlayerStatus.AutoPaused].includes(player?.status))
                player?.pause(true);
        });
    }
    get player() {
        return this._player;
    }
    set autoPaused(paused) {
        this._autoPaused = paused;
        if (paused && ![voice_1.AudioPlayerStatus.Paused, voice_1.AudioPlayerStatus.AutoPaused].includes(this.player?.status))
            this.player?.pause(true);
        else if (!paused && [voice_1.AudioPlayerStatus.Paused, voice_1.AudioPlayerStatus.AutoPaused].includes(this.player?.status))
            this.player?.pause(false);
    }
    get autoPaused() {
        return this._autoPaused;
    }
}
exports.Resource = Resource;