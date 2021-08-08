"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManagerImpl = void 0;
const Cache_1 = require("./Cache");
/**
 * The default implementation of {@link CacheManager | CacheManager}
 */
class CacheManagerImpl {
    /**
     * @internal
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
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
    }
    /**
     * @internal
     */
    setPath(path) {
        this.path = path;
        this.youtube.setPath(path);
        this.soundcloud.setPath(path);
        this.local.setPath(path);
    }
}
exports.CacheManagerImpl = CacheManagerImpl;
