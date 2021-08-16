"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Skipper = void 0;
const validation_1 = require("../validation");
const stream_1 = require("stream");
const Bps = 192000;
/**
 * The instance for skipping the audio
 */
class Skipper extends stream_1.Writable {
    /**
     * @param seconds The amount to skip in second
     * @param _cacheWriter The audio cache writer
     */
    constructor(seconds, _cacheWriter) {
        super();
        this._cacheWriter = _cacheWriter;
        validation_1.SkipperValidation.validateSeconds(seconds);
        validation_1.SkipperValidation.validateCacheWriter(_cacheWriter);
        this._bytes = Bps * seconds;
    }
    /**
     * @internal
     */
    _write(chunk, _, cb) {
        this._bytes -= chunk.length;
        if (this._bytes <= 0) {
            this._cacheWriter.unpipe();
            this.destroy();
        }
        cb();
    }
    /**
     * @internal
     */
    _final(cb) {
        this._cacheWriter.unpipe();
        this.destroy();
        cb();
    }
}
exports.Skipper = Skipper;
