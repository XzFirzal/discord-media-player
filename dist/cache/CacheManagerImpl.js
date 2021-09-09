"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManagerImpl = void 0;
const validation_1 = require("../validation");
const child_process_1 = require("child_process");
const Cache_1 = require("./Cache");
/**
 * The default implementation of {@link CacheManager | CacheManager}
 */
class CacheManagerImpl {
    /**
     * @internal
     */
    constructor() {
        /**
         * @internal
         */
        this.youtube = new Cache_1.Cache("youtube");
        /**
         * @internal
         */
        this.soundcloud = new Cache_1.Cache("soundcloud");
        /**
         * @internal
         */
        this.local = new Cache_1.Cache("local");
        /**
         * @internal
         */
        this.deleter = child_process_1.fork(require.resolve("./CacheDeleter"), { detached: true });
        this.deleter.unref();
    }
    /**
     * @internal
     */
    setTimeout(timeout) {
        validation_1.CacheManagerValidation.validateTimeout(timeout);
        this.timeout = timeout;
        this.youtube.setOptions({ timeout });
        this.soundcloud.setOptions({ timeout });
        this.local.setOptions({ timeout });
    }
    /**
     * @internal
     */
    setPath(path) {
        validation_1.CacheManagerValidation.validatePath(path);
        this.path = path;
        this.youtube.setOptions({ path });
        this.soundcloud.setOptions({ path });
        this.local.setOptions({ path });
        this.deleter.send([0, path]);
    }
    /**
     * @internal
     */
    async delete() {
        if (!this.path)
            return;
        this.deleter.send([1]);
        await new Promise((res) => this.deleter.once("exit", res));
    }
}
exports.CacheManagerImpl = CacheManagerImpl;
