"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
const validation_1 = require("../validation");
const voice_1 = require("@discordjs/voice");
/**
 * The audio resource instance
 */
class Resource {
    /**
     * @param options The options to create audio resource
     */
    constructor(options) {
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
        validation_1.ResourceValidation.validateOptions(options);
        const { player, identifier, decoder, source, cache, isLive, demuxer, cacheWriter } = options;
        this.player = player;
        this.identifier = identifier;
        this.cache = cache;
        this.source = source;
        this.demuxer = demuxer;
        this.decoder = decoder;
        this.cacheWriter = cacheWriter;
        this.isLive = isLive ?? false;
        cacheWriter.setResource(this);
    }
    set player(player) {
        if (player != null)
            validation_1.ResourceValidation.validatePlayer(player);
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
        validation_1.ResourceValidation.validatePaused(paused);
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
