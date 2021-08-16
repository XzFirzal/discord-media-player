"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSeconds = exports.validateResource = exports.validateIdentifier = exports.validateOptions = exports.validateDir = void 0;
const PlayerError_1 = require("./PlayerError");
const Resource_1 = require("../util/Resource");
/**
 * Validate the cache directory
 * @param dir The cache directory
 */
function validateDir(dir) {
    if (typeof dir !== "string")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", "Cache.dir", typeof dir));
}
exports.validateDir = validateDir;
/**
 * Validate the cache options
 * @param options The cache options
 */
function validateOptions(options) {
    if (typeof options !== "object" || options === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "CacheOptions", options === null ? "null" : typeof options));
    if (!("path" in options) && !("timeout" in options))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.AtleastHave("CacheOptions", ["path", "timeout"]));
    if ("path" in options)
        if (typeof options.path !== "string")
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", "CacheOptions.path", typeof options.path));
    if ("timeout" in options) {
        if (typeof options.timeout !== "number")
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "CacheOptions.timeout", typeof options.timeout));
        else if (!Number.isInteger(options.timeout))
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotInteger(options.timeout));
    }
}
exports.validateOptions = validateOptions;
/**
 * Validate the cache identifier
 * @param identifier The cache identifier
 */
function validateIdentifier(identifier) {
    if (typeof identifier !== "string")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", "Cache.identifier", typeof identifier));
}
exports.validateIdentifier = validateIdentifier;
/**
 * Validate the cache resource
 * @param resource The cache resource
 */
function validateResource(resource) {
    if (typeof resource !== "object" || resource === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "Cache.resource", resource === null ? "null" : typeof resource));
    else if (!(resource instanceof Resource_1.Resource))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("Resource", "Cache.resource", resource));
}
exports.validateResource = validateResource;
/**
 * Validate the seconds
 * @param seconds Where to start the audio (in seconds)
 */
function validateSeconds(seconds) {
    if (typeof seconds !== "number")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "Cache.seconds", typeof seconds));
}
exports.validateSeconds = validateSeconds;
