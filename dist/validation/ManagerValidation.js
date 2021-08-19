"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlayer = exports.validateConnection = exports.validateOptions = void 0;
const PlayerError_1 = require("./PlayerError");
const voice_1 = require("@discordjs/voice");
const soundcloud_downloader_1 = __importDefault(require("soundcloud-downloader"));
const Cache_1 = require("../cache/Cache");
function validateCacheManager(cacheManager) {
    if (typeof cacheManager !== "object" || cacheManager === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "AudioManagerOptions.cache", cacheManager === null ? "null" : typeof cacheManager));
    if (!("youtube" in cacheManager))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("youtube", "AudioManagerOptions.cache"));
    else if (!(cacheManager.youtube instanceof Cache_1.Cache))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("Cache", "AudioManagerOptions.cache.youtube", cacheManager.youtube));
    if (!("soundcloud" in cacheManager))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("soundcloud", "AudioManagerOptions.cache"));
    else if (!(cacheManager.soundcloud instanceof Cache_1.Cache))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("Cache", "AudioManagerOptions.cache.soundcloud", cacheManager.soundcloud));
    if (!("local" in cacheManager))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("local", "AudioManagerOptions.cache"));
    else if (!(cacheManager.local instanceof Cache_1.Cache))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("Cache", "AudioManagerOptions.cache.local", cacheManager.local));
    if (typeof cacheManager.setPath !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManagerOptions.cache.setPath", typeof cacheManager.setPath));
    if (typeof cacheManager.setTimeout !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManagerOptions.cache.setTimeout", typeof cacheManager.setTimeout));
}
/**
 * Validate the audio manager options
 * @param options The audio manager options
 */
function validateOptions(options) {
    if (typeof options !== "object" || options === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "AudioManagerOptions", options === null ? "null" : typeof options));
    if ("cache" in options) {
        validateCacheManager(options.cache);
        if ("cacheDir" in options && typeof options.cacheDir !== "string")
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", "AudioManagerOptions.cacheDir", typeof options.cacheDir));
        if ("cacheTimeout" in options && typeof options.cacheTimeout !== "number")
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "AudioManagerOptions.cacheTimeout", typeof options.cacheTimeout));
    }
    if ("soundcloudClient" in options) {
        if (typeof options.soundcloudClient !== "object" || options.soundcloudClient === null)
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "AudioManagerOptions.soundcloudClient", options.soundcloudClient === null ? "null" : typeof options.soundcloudClient));
        if (!(options.soundcloudClient instanceof soundcloud_downloader_1.default.constructor))
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("SCDL", "AudioManagerOptions.soundcloudClient", options.soundcloudClient));
    }
    if ("createAudioPlayer" in options && typeof options.createAudioPlayer !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManagerOptions.createAudioPlayer", typeof options.createAudioPlayer));
}
exports.validateOptions = validateOptions;
/**
 * Validate the voice connection
 * @param connection The voice connection
 */
function validateConnection(connection) {
    if (typeof connection !== "object" || connection === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "AudioManager.connection", connection === null ? "null" : typeof connection));
    if (!(connection instanceof voice_1.VoiceConnection))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("VoiceConnection", "AudioManager.connection", connection));
}
exports.validateConnection = validateConnection;
/**
 * Validate the audio player
 * @param player The audio player
 */
function validatePlayer(player) {
    if (typeof player !== "object" || player === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "AudioManager.createAudioPlayer()", player === null ? "null" : typeof player));
    if (!("manager" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("manager", "AudioManager.createAudioPlayer()"));
    if (!("guildID" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("guildID", "AudioManager.createAudioPlayer()"));
    if (!("status" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("status", "AudioManager.createAudioPlayer()"));
    else if (typeof player.status !== "string")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", "AudioManager.createAudioPlayer().status", typeof player.status));
    if (!("playing" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("playing", "AudioManager.createAudioPlayer()"));
    else if (typeof player.playing !== "boolean")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("boolean", "AudioManager.createAudioPlayer().playing", typeof player.playing));
    if (!("setManager" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("setManager", "AudioManager.createAudioPlayer()"));
    else if (typeof player.setManager !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManager.createAudioPlayer().setManager", typeof player.setManager));
    if (!("link" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("link", "AudioManager.createAudioPlayer()"));
    else if (typeof player.link !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManager.createAudioPlayer().link", typeof player.link));
    if (!("unlink" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("unlink", "AudioManager.createAudioPlayer()"));
    else if (typeof player.unlink !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManager.createAudioPlayer().unlink", typeof player.unlink));
    if (!("setFilter" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("setFilter", "AudioManager.createAudioPlayer()"));
    else if (typeof player.setFilter !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManager.createAudioPlayer().setFilter", typeof player.setFilter));
    if (!("setVolume" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("setVolume", "AudioManager.createAudioPlayer()"));
    else if (typeof player.setVolume !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManager.createAudioPlayer().setVolume", typeof player.setVolume));
    if (!("stop" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("stop", "AudioManager.createAudioPlayer()"));
    else if (typeof player.stop !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManager.createAudioPlayer().stop", typeof player.stop));
    if (!("loop" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("loop", "AudioManager.createAudioPlayer()"));
    else if (typeof player.loop !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManager.createAudioPlayer().loop", typeof player.loop));
    if (!("pause" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("pause", "AudioManager.createAudioPlayer()"));
    else if (typeof player.pause !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManager.createAudioPlayer().pause", typeof player.pause));
    if (!("filter" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("filter", "AudioManager.createAudioPlayer()"));
    else if (typeof player.filter !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManager.createAudioPlayer().filter", typeof player.filter));
    if (!("seek" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("seek", "AudioManager.createAudioPlayer()"));
    else if (typeof player.seek !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManager.createAudioPlayer().seek", typeof player.seek));
    if (!("play" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("play", "AudioManager.createAudioPlayer()"));
    else if (typeof player.play !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManager.createAudioPlayer().play", typeof player.play));
    if (!("_switchCache" in player))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("_switchCache", "AudioManager.createAudioPlayer()"));
    else if (typeof player._switchCache !== "function")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("function", "AudioManager.createAudioPlayer()._switchCache", typeof player._switchCache));
}
exports.validatePlayer = validatePlayer;
