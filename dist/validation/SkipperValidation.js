"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCacheWriter = exports.validateSeconds = void 0;
const PlayerError_1 = require("./PlayerError");
const CacheWriter_1 = require("../cache/CacheWriter");
function validateSeconds(seconds) {
    if (typeof seconds !== "number")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "Skipper.seconds", typeof seconds));
}
exports.validateSeconds = validateSeconds;
function validateCacheWriter(cacheWriter) {
    if (typeof cacheWriter !== "object" || cacheWriter === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "Skipper.cacheWriter", cacheWriter === null ? "null" : typeof cacheWriter));
    else if (!(cacheWriter instanceof CacheWriter_1.CacheWriter))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("CacheWriter", "Skipper.cacheWriter", cacheWriter));
}
exports.validateCacheWriter = validateCacheWriter;
