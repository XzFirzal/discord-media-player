"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Resource = void 0;
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
}
exports.Resource = Resource;
