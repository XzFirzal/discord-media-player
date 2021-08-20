"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlayer = exports.validateConnection = exports.validateOptions = void 0;
const PlayerValidation_1 = require("./PlayerValidation");
const PlayerError_1 = require("./PlayerError");
const voice_1 = require("@discordjs/voice");
const Cache_1 = require("../cache/Cache");
const soundcloud_downloader_1 = __importDefault(require("soundcloud-downloader"));
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
    PlayerValidation_1.validatePlayer(player, "AudioManager.createAudioPlayer()");
}
exports.validatePlayer = validatePlayer;
