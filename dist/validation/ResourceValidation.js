"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePaused = exports.validatePlayer = exports.validateOptions = void 0;
const PlayerError_1 = require("./PlayerError");
const stream_1 = require("stream");
const CacheWriter_1 = require("../cache/CacheWriter");
const Cache_1 = require("../cache/Cache");
function validatePlayerOption(player) {
    if (typeof player !== "object" || player === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "ResourceOptions.player", player === null ? "null" : typeof player));
    if (!("manager" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("manager", "ResourceOptions.player"));
    if (!("guildID" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("guildID", "ResourceOptions.player"));
    if (!("status" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("status", "ResourceOptions.player"));
    else if (typeof player.status !== "string")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", "ResourceOptions.player.status", typeof player.status));
    if (!("playing" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("playing", "ResourceOptions.player"));
    else if (typeof player.playing !== "boolean")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("boolean", "ResourceOptions.player.playing", typeof player.playing));
    if (!("setManager" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("setManager", "ResourceOptions.player"));
    else if (typeof player.setManager !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "ResourceOptions.player.setManager", typeof player.setManager));
    if (!("link" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("link", "ResourceOptions.player"));
    else if (typeof player.link !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "ResourceOptions.player.link", typeof player.link));
    if (!("unlink" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("unlink", "ResourceOptions.player"));
    else if (typeof player.unlink !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "ResourceOptions.player.unlink", typeof player.unlink));
    if (!("setFilter" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("setFilter", "ResourceOptions.player"));
    else if (typeof player.setFilter !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "ResourceOptions.player.setFilter", typeof player.setFilter));
    if (!("setVolume" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("setVolume", "ResourceOptions.player"));
    else if (typeof player.setVolume !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "ResourceOptions.player.setVolume", typeof player.setVolume));
    if (!("stop" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("stop", "ResourceOptions.player"));
    else if (typeof player.stop !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "ResourceOptions.player.stop", typeof player.stop));
    if (!("loop" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("loop", "ResourceOptions.player"));
    else if (typeof player.loop !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "ResourceOptions.player.loop", typeof player.loop));
    if (!("pause" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("pause", "ResourceOptions.player"));
    else if (typeof player.pause !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "ResourceOptions.player.pause", typeof player.pause));
    if (!("filter" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("filter", "ResourceOptions.player"));
    else if (typeof player.filter !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "ResourceOptions.player.filter", typeof player.filter));
    if (!("seek" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("seek", "ResourceOptions.player"));
    else if (typeof player.seek !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "ResourceOptions.player.seek", typeof player.seek));
    if (!("play" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("play", "ResourceOptions.player"));
    else if (typeof player.play !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "ResourceOptions.player.play", typeof player.play));
    if (!("_switchCache" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("_switchCache", "ResourceOptions.player"));
    else if (typeof player._switchCache !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "ResourceOptions.player._switchCache", typeof player._switchCache));
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
    if (options.cacheWriter != undefined) {
        if (typeof options.cacheWriter !== "object" || options.cacheWriter === null)
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "ResourceOptions.cacheWriter", options.cacheWriter === null ? "null" : typeof options.cacheWriter));
        else if (!(options.cacheWriter instanceof CacheWriter_1.CacheWriter))
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("CacheWriter", "ResourceOptions.cacheWriter", options.cacheWriter));
    }
}
exports.validateOptions = validateOptions;
function validatePlayer(player) {
    if (typeof player !== "object" || player === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "Resource.player", player === null ? "null" : typeof player));
    if (!("manager" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("manager", "Resource.player"));
    if (!("guildID" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("guildID", "Resource.player"));
    if (!("status" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("status", "Resource.player"));
    else if (typeof player.status !== "string")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", "Resource.player.status", typeof player.status));
    if (!("playing" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("playing", "Resource.player"));
    else if (typeof player.playing !== "boolean")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("boolean", "Resource.player.playing", typeof player.playing));
    if (!("setManager" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("setManager", "Resource.player"));
    else if (typeof player.setManager !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "Resource.player.setManager", typeof player.setManager));
    if (!("link" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("link", "Resource.player"));
    else if (typeof player.link !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "Resource.player.link", typeof player.link));
    if (!("unlink" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("unlink", "Resource.player"));
    else if (typeof player.unlink !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "Resource.player.unlink", typeof player.unlink));
    if (!("setFilter" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("setFilter", "Resource.player"));
    else if (typeof player.setFilter !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "Resource.player.setFilter", typeof player.setFilter));
    if (!("setVolume" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("setVolume", "Resource.player"));
    else if (typeof player.setVolume !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "Resource.player.setVolume", typeof player.setVolume));
    if (!("stop" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("stop", "Resource.player"));
    else if (typeof player.stop !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "Resource.player.stop", typeof player.stop));
    if (!("loop" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("loop", "Resource.player"));
    else if (typeof player.loop !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "Resource.player.loop", typeof player.loop));
    if (!("pause" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("pause", "Resource.player"));
    else if (typeof player.pause !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "Resource.player.pause", typeof player.pause));
    if (!("filter" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("filter", "Resource.player"));
    else if (typeof player.filter !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "Resource.player.filter", typeof player.filter));
    if (!("seek" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("seek", "Resource.player"));
    else if (typeof player.seek !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "Resource.player.seek", typeof player.seek));
    if (!("play" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("play", "Resource.player"));
    else if (typeof player.play !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "Resource.player.play", typeof player.play));
    if (!("_switchCache" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("_switchCache", "Resource.player"));
    else if (typeof player._switchCache !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "Resource.player._switchCache", typeof player._switchCache));
}
exports.validatePlayer = validatePlayer;
function validatePaused(paused) {
    if (typeof paused !== "boolean")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("boolean", "Resource.autoPaused", typeof paused));
}
exports.validatePaused = validatePaused;
