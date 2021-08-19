"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSoundcloudSearchOptions = exports.validateYoutubeSearchOptions = exports.validateConnection = exports.validateAudioManager = void 0;
const PlayerError_1 = require("./PlayerError");
const voice_1 = require("@discordjs/voice");
function validateAudioManager(audioManager) {
    if (typeof audioManager !== "object" || audioManager === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "QueueManager.audioManager", audioManager === null ? "null" : typeof audioManager));
}
exports.validateAudioManager = validateAudioManager;
function validateConnection(connection) {
    if (typeof connection !== "object" || connection === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "QueueManager.connection", connection === null ? "null" : typeof connection));
    else if (!(connection instanceof voice_1.VoiceConnection))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("VoiceConnection", "QueueManager.connection", connection));
}
exports.validateConnection = validateConnection;
function validateYoutubeSearchOptions(options) {
    if (typeof options !== "object" || options === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "YoutubeSearchOptions", options === null ? "null" : typeof options));
    if (!("query" in options))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("query", "YoutubeSearchOptions"));
    else if (typeof options.query !== "string")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", "YoutubeSearchOptions.query", typeof options.query));
    if ("searchLimit" in options && typeof options.searchLimit !== "number")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "YoutubeSearchOptions.searchLimit", typeof options.searchLimit));
    if ("playlistLimit" in options && typeof options.playlistLimit !== "number")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "YoutubeSearchOptions.playlistLimit", typeof options.playlistLimit));
}
exports.validateYoutubeSearchOptions = validateYoutubeSearchOptions;
function validateSoundcloudSearchOptions(options) {
    if (typeof options !== "object" || options === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "SoundcloudSearchOptions", options === null ? "null" : typeof options));
    if (!("query" in options))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided("query", "SoundcloudSearchOptions"));
    else if (typeof options.query !== "string")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", "SoundcloudSearchOptions.query", typeof options.query));
    if ("searchLimit" in options && typeof options.searchLimit !== "number")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "SoundcloudSearchOptions.searchLimit", typeof options.searchLimit));
    if ("searchOffset" in options && typeof options.searchOffset !== "number")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "SoundcloudSearchOptions.searchOffset", typeof options.searchOffset));
    if ("setLimit" in options && typeof options.setLimit !== "number")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "SoundcloudSearchOptions.setLimit", typeof options.setLimit));
}
exports.validateSoundcloudSearchOptions = validateSoundcloudSearchOptions;
