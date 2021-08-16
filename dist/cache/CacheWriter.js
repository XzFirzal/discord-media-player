"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheWriter = void 0;
const validation_1 = require("../validation");
const stream_1 = require("stream");
const Bps = 192000;
/**
 * The instance to write audio into cache
 */
class CacheWriter extends stream_1.Transform {
    /**
     * The cache writable stream
     */
    get writeStream() {
        return this._cache;
    }
    /**
     * Set the audio resource
     * @param resource The audio resource
     */
    setResource(resource) {
        validation_1.CacheWriterValidation.validateResource(resource);
        this._resource = resource;
        if (resource.cache) {
            validation_1.CacheWriterValidation.validateCache(resource.cache);
            this._cache = resource.cache.create(resource.identifier, resource);
            this._cache.on("drain", () => {
                this._awaitDrain?.();
            });
            this._cache.once("close", () => {
                if (resource.cache.hasCache(resource.identifier))
                    this.emit("stop");
                this.destroy();
                this._cache.destroy();
            });
        }
    }
    /**
     * @internal
     */
    _addSecond(seconds) {
        this._resource.cachedSecond += seconds;
    }
    /**
     * @internal
     */
    _transform(chunk, _, cb) {
        this._addSecond(chunk.length / Bps);
        this.push(chunk);
        if (this._cache && !this._cache.write(chunk)) {
            this._awaitDrain = cb;
        }
        else
            cb();
    }
    /**
     * @internal
     */
    _flush(cb) {
        this.once("end", () => {
            this._resource.allCached = true;
            if (this._cache)
                this._cache?.end();
            else
                this.destroy();
        });
        cb();
    }
    /**
     * @internal
     */
    pipe(destination, options) {
        this.emit("play");
        return super.pipe(destination, options);
    }
    /**
     * @internal
     */
    unpipe(destination) {
        this.emit("stop");
        return super.unpipe(destination);
    }
}
exports.CacheWriter = CacheWriter;
