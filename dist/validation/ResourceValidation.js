"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePaused = exports.validatePlayer = exports.validateOptions = void 0;
const PlayerValidation_1 = require("./PlayerValidation");
const PlayerError_1 = require("./PlayerError");
const stream_1 = require("stream");
const CacheWriter_1 = require("../cache/CacheWriter");
const Cache_1 = require("../cache/Cache");
function validatePlayerOption(player) {
    PlayerValidation_1.validatePlayer(player, "ResourceOptions.player");
}
function validateOptions(options) {
    if (typeof options !== "object" || options === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "ResourceOptions", options === null ? "null" : typeof options));
    if (!("player" in options))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("player", "ResourceOptions"));
    else
        validatePlayerOption(options.player);
    if (!("identifier" in options))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("identifier", "ResourceOptions"));
    else if (typeof options.identifier !== "string")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", "ResourceOptions.identifier", typeof options.identifier));
    if (!("decoder" in options))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("decoder", "ResourceOptions"));
    else if (typeof options.decoder !== "object" || options.decoder === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "ResourceOptions.decoder", options.decoder === null ? "null" : typeof options.decoder));
    else if (!(options.decoder instanceof stream_1.Transform || options.decoder instanceof stream_1.Duplex))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting(["Duplex", "Transform"], "ResourceOptions.decoder", options.decoder));
    if (!("source" in options))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("source", "ResourceOptions"));
    else if (typeof options.source !== "object" || options.source === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "ResourceOptions.source", options.source === null ? "null" : typeof options.source));
    else if (!(options.source instanceof stream_1.Readable))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("Readable", "ResourceOptions.source", options.source));
    if (!("cacheWriter" in options))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("cacheWriter", "ResourceOptions"));
    else if (typeof options.cacheWriter !== "object" || options.cacheWriter === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "ResourceOptions.cacheWriter", options.cacheWriter === null ? "null" : typeof options.cacheWriter));
    else if (!(options.cacheWriter instanceof CacheWriter_1.CacheWriter))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("CacheWriter", "ResourceOptions.cacheWriter", options.cacheWriter));
    if (options.cache != undefined) {
        if (typeof options.cache !== "object" || options.cache === null)
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "ResourceOptions.cache", options.cache === null ? "null" : typeof options.cache));
        else if (!(options.cache instanceof Cache_1.Cache))
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("Cache", "ResourceOptions.cache", options.cache));
    }
    if (options.demuxer != undefined) {
        if (typeof options.demuxer !== "object" || options.demuxer === null)
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "ResourceOptions.demuxer", options.demuxer === null ? "null" : typeof options.demuxer));
        else if (!(options.demuxer instanceof stream_1.Transform))
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("Transform", "ResourceOptions.demuxer", options.demuxer));
    }
    if ("isLive" in options && typeof options.isLive !== "boolean")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("boolean", "ResourceOptions.isLive", typeof options.isLive));
}
exports.validateOptions = validateOptions;
function validatePlayer(player) {
    PlayerValidation_1.validatePlayer(player, "Resource.player");
}
exports.validatePlayer = validatePlayer;
function validatePaused(paused) {
    if (typeof paused !== "boolean")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("boolean", "Resource.autoPaused", typeof paused));
}
exports.validatePaused = validatePaused;
