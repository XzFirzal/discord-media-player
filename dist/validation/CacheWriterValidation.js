"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCache = exports.validateResource = void 0;
const PlayerError_1 = require("./PlayerError");
const Resource_1 = require("../util/Resource");
const Cache_1 = require("../cache/Cache");
function validateResource(resource) {
    if (typeof resource !== "object" || resource === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "CacheWriter.resource", resource === null ? "null" : typeof resource));
    else if (!(resource instanceof Resource_1.Resource))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("Resource", "CacheManager.resource", resource));
}
exports.validateResource = validateResource;
function validateCache(cache) {
    if (typeof cache !== "object" || cache === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "CacheWriter.resource.cache", cache === null ? "null" : typeof cache));
    else if (!(cache instanceof Cache_1.Cache))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("Cache", "CacheManager.resource.cache", cache));
}
exports.validateCache = validateCache;
