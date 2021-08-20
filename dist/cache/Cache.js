"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const prism_media_1 = require("prism-media");
const stream_1 = require("stream");
const noop_1 = require("../util/noop");
const path_1 = require("path");
const promises_1 = require("fs/promises");
const CacheReader_1 = require("./CacheReader");
const fs_1 = require("fs");
const PacketReader_1 = require("./PacketReader");
const validation_1 = require("../validation");
/**
 * The cache instance to manage cache for a source
 */
class Cache {
    /**
     * @param dir The directory of the cache
     */
    constructor(dir) {
        /**
         * @internal
         */
        this._timeouts = new Map();
        /**
         * @internal
         */
        this._packets = new Map();
        /**
         * @internal
         */
        this._resources = new Map();
        /**
         * @internal
         */
        this._users = new Map();
        /**
         * @internal
         */
        this._reader = new Map();
        validation_1.CacheValidation.validateDir(dir);
        this._dir = dir;
    }
    /**
     * The full path of base directory and directory
     */
    get path() {
        return path_1.join(this.basePath, this._dir);
    }
    /**
     * Set the options for cache
     * @param options The cache options
     */
    setOptions(options) {
        validation_1.CacheValidation.validateOptions(options);
        if (options.timeout)
            this.timeout = options.timeout;
        if (options.path) {
            this.basePath = options.path;
            fs_1.mkdirSync(this.path);
        }
    }
    /**
     * Create a new cache
     * @param identifier The audio identifier
     * @param resource The audio resource
     * @returns The OpusEncoder stream to compress and write cache
     */
    create(identifier, resource) {
        validation_1.CacheValidation.validateIdentifier(identifier);
        validation_1.CacheValidation.validateResource(resource);
        this._checkNotExist(identifier);
        const encoder = new prism_media_1.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });
        const writeStream = fs_1.createWriteStream(path_1.join(this.path, identifier), { emitClose: true });
        this._resources.set(identifier, resource);
        this._timeouts.set(identifier, setTimeout(this._deleteCache.bind(this, identifier), this.timeout));
        this._packets.set(identifier, []);
        this._users.set(identifier, 0);
        resource.cacheWriter.on("play", this._addUser.bind(this, identifier));
        resource.cacheWriter.on("stop", this._removeUser.bind(this, identifier));
        writeStream.once("close", () => {
            if (this.hasCache(identifier) && !resource.allCached) {
                if (this._timeouts.has(identifier))
                    clearTimeout(this._timeouts.get(identifier));
                this._deleteCache(identifier);
            }
        });
        stream_1.pipeline(encoder, new PacketReader_1.PacketReader(this._packets.get(identifier)), writeStream, noop_1.noop);
        return encoder;
    }
    /**
     * Read an existing cache
     * @param identifier The audio identifier
     * @param startOnSeconds Start reading cache on specific second of audio
     * @returns The OpusDecoder stream of audio
     */
    read(identifier, startOnSeconds = 0) {
        validation_1.CacheValidation.validateIdentifier(identifier);
        validation_1.CacheValidation.validateSeconds(startOnSeconds);
        this._checkExist(identifier);
        const file = promises_1.open(path_1.join(this.path, identifier), "r");
        const reader = new CacheReader_1.CacheReader(this._packets.get(identifier), file, Math.floor(startOnSeconds * 1000));
        const decoder = new prism_media_1.opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 });
        this._reader.set(decoder, reader);
        this._addUser(identifier);
        reader.once("close", async () => await (await file).close());
        decoder.once("close", () => {
            this._reader.delete(decoder);
            this._removeUser(identifier);
            reader.destroy();
        });
        stream_1.pipeline(reader, decoder, noop_1.noop);
        return decoder;
    }
    /**
     * Check if cache exist
     * @param identifier The audio identifier
     * @returns true if exist, otherwise false
     */
    hasCache(identifier) {
        validation_1.CacheValidation.validateIdentifier(identifier);
        return this._resources.has(identifier);
    }
    /**
     * Get the audio resource from an existing cache
     * @param identifier The audio identifier
     * @returns The audio resource
     */
    getResource(identifier) {
        validation_1.CacheValidation.validateIdentifier(identifier);
        this._checkExist(identifier);
        return this._resources.get(identifier);
    }
    /**
     * Get the cache reader of decoder from cache
     * @param decoder The opus decoder
     * @returns The cache reader
     */
    getReader(decoder) {
        validation_1.CacheValidation.validateDecoder(decoder);
        return this._reader.get(decoder);
    }
    /**
     * @internal
     */
    _deleteCache(identifier) {
        const writeStream = this._resources.get(identifier).cacheWriter.writeStream;
        this._resources.delete(identifier);
        this._timeouts.delete(identifier);
        this._packets.delete(identifier);
        this._users.delete(identifier);
        if (!writeStream.destroyed)
            writeStream.destroy();
        promises_1.unlink(path_1.join(this.path, identifier));
    }
    /**
     * @internal
     */
    _removeUser(identifier) {
        this._users.set(identifier, this._users.get(identifier) - 1);
        if (this._users.get(identifier) <= 0 && !this._timeouts.has(identifier))
            this._timeouts.set(identifier, setTimeout(this._deleteCache.bind(this, identifier), this.timeout));
    }
    /**
     * @internal
     */
    _addUser(identifier) {
        this._users.set(identifier, this._users.get(identifier) + 1);
        if (this._timeouts.has(identifier)) {
            clearTimeout(this._timeouts.get(identifier));
            this._timeouts.delete(identifier);
        }
    }
    /**
     * @internal
     */
    _checkExist(identifier) {
        if (!this.hasCache(identifier))
            throw new validation_1.PlayerError(validation_1.ErrorMessages.CacheNotExist(identifier));
    }
    /**
     * @internal
     */
    _checkNotExist(identifier) {
        if (this.hasCache(identifier))
            throw new validation_1.PlayerError(validation_1.ErrorMessages.CacheAlreadyExist(identifier));
    }
}
exports.Cache = Cache;
