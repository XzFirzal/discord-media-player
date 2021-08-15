"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
const promises_1 = require("fs/promises");
const path_1 = require("path");
const fs_1 = require("fs");
const Bps = 192000;
const Extension = ".tmp";
const CacheDeletedAfter = 1000 * 60 * 10;
function stableCalculate(seconds) {
    if (!seconds)
        return 0;
    if (Number.isInteger(seconds))
        return seconds * Bps;
    const base = Math.floor(seconds);
    let result = String(base);
    if (seconds >= base + .9)
        result += "9";
    else if (seconds >= base + .8)
        result += "8";
    else if (seconds >= base + .7)
        result += "7";
    else if (seconds >= base + .6)
        result += "6";
    else if (seconds >= base + .5)
        result += "5";
    else if (seconds >= base + .4)
        result += "4";
    else if (seconds >= base + .3)
        result += "3";
    else if (seconds >= base + .2)
        result += "2";
    else if (seconds >= base + .1)
        result += "1";
    else
        result += "0";
    return Math.floor((Number(result) * Bps) / 10);
}
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
        this._resources = new Map();
        /**
         * @internal
         */
        this._users = new Map();
        this.dir = dir;
    }
    /**
     * The full path of base directory and directory
     */
    get path() {
        return path_1.join(this.basePath, this.dir);
    }
    /**
     * Set the base directory
     * @param path The base directory path
     */
    setPath(path) {
        this.basePath = path;
        fs_1.mkdirSync(this.path);
    }
    /**
     * Create a new cache
     * @param identifier The audio identifier
     * @param resource The audio resource
     * @returns The writable stream to write cache
     */
    create(identifier, resource) {
        if (this._resources.has(identifier))
            throw new Error(`Cache with identifier '${identifier}' already exist`);
        const writeStream = fs_1.createWriteStream(path_1.join(this.path, identifier + Extension), { emitClose: true });
        this._resources.set(identifier, resource);
        this._timeouts.set(identifier, setTimeout(this._deleteCache.bind(this, identifier), CacheDeletedAfter));
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
        return writeStream;
    }
    /**
     * Read an existing cache
     * @param identifier The audio identifier
     * @param startOnSeconds Start reading cache on specific second of audio
     * @returns The readable stream of audio
     */
    read(identifier, startOnSeconds = 0) {
        if (!this._resources.has(identifier))
            throw new Error(`Cache with identifier '${identifier}' doesn't exist`);
        const readStream = fs_1.createReadStream(path_1.join(this.path, identifier + Extension), { start: stableCalculate(startOnSeconds), emitClose: true });
        this._addUser(identifier);
        readStream.once("close", () => {
            this._removeUser(identifier);
            readStream.destroy();
        });
        return readStream;
    }
    /**
     * Check if cache exist
     * @param identifier The audio identifier
     * @returns true if exist, otherwise false
     */
    hasCache(identifier) {
        return this._resources.has(identifier);
    }
    /**
     * Get the audio resource from an existing cache
     * @param identifier The audio identifier
     * @returns The audio resource
     */
    getResource(identifier) {
        if (!this._resources.has(identifier))
            throw new Error(`Cache with identifier '${identifier}' doesn't exist`);
        return this._resources.get(identifier);
    }
    /**
     * @internal
     */
    _deleteCache(identifier) {
        const writeStream = this._resources.get(identifier).cacheWriter.writeStream;
        this._resources.delete(identifier);
        this._timeouts.delete(identifier);
        this._users.delete(identifier);
        if (!writeStream.destroyed)
            writeStream.destroy();
        promises_1.unlink(path_1.join(this.path, identifier + Extension));
    }
    /**
     * @internal
     */
    _removeUser(identifier) {
        this._users.set(identifier, this._users.get(identifier) - 1);
        if (this._users.get(identifier) <= 0 && !this._timeouts.has(identifier))
            this._timeouts.set(identifier, setTimeout(this._deleteCache.bind(this, identifier), CacheDeletedAfter));
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
}
exports.Cache = Cache;
