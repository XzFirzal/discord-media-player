"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSourceType = exports.validateUrlOrLocation = exports.validateSeconds = exports.validateVolume = exports.validateFilters = exports.validateConnection = exports.validateManager = void 0;
const PlayerError_1 = require("./PlayerError");
const AudioManager_1 = require("../audio/AudioManager");
const voice_1 = require("@discordjs/voice");
const filters = {
    acompressor: 0,
    aconstrast: 0,
    acrossfade: 0,
    acrossover: 0,
    acrusher: 0,
    adeclick: 0,
    adeclip: 0,
    adelay: 0,
    adenorm: 0,
    aecho: 0,
    aemphasis: 0,
    aexciter: 0,
    afade: 0,
    afftdn: 0,
    afftfilt: 0,
    afir: 0,
    afreqshift: 0,
    agate: 0,
    aiir: 0,
    allpass: 0,
    anequalizer: 0,
    anlmdn: 0,
    apad: 0,
    aphaser: 0,
    aphaseshift: 0,
    apulsator: 0,
    aresample: 0,
    arnndn: 0,
    asetnsamples: 0,
    asetrate: 0,
    asoftclip: 0,
    asubbost: 0,
    asubcut: 0,
    asupercut: 0,
    asuperpass: 0,
    asuperstop: 0,
    atempo: 0,
    bandpass: 0,
    bandreject: 0,
    bass: 0,
    biquad: 0,
    chorus: 0,
    compand: 0,
    compensationdelay: 0,
    crossfeed: 0,
    crystalizer: 0,
    dcshift: 0,
    deesser: 0,
    dynaudnorm: 0,
    earwax: 0,
    equalizer: 0,
    extrastereo: 0,
    firequalizer: 0,
    flanger: 0,
    haas: 0,
    headphone: 0,
    highpass: 0,
    highshelf: 0,
    loudnorm: 0,
    lowpass: 0,
    lowshelf: 0,
    mcompand: 0,
    silenceremove: 0,
    speechnorm: 0,
    stereowiden: 0,
    superequalizer: 0,
    surround: 0,
    treble: 0,
    vibrato: 0
};
/**
 * Validate the audio manager
 * @param manager The audio manager
 */
function validateManager(manager) {
    if (typeof manager !== "object" || manager === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "AudioPlayer.manager", manager === null ? "null" : typeof manager));
    if (!(manager instanceof AudioManager_1.AudioManager))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("AudioManager", "AudioPlayer.manager", manager));
}
exports.validateManager = validateManager;
/**
 * Validate the voice connection
 * @param connection The voice connection
 */
function validateConnection(connection) {
    if (typeof connection !== "object" || connection === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "AudioPlayer.connection", connection === null ? "null" : typeof connection));
    if (!(connection instanceof voice_1.VoiceConnection))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("VoiceConnection", "AudioPlayer.connection", connection));
}
exports.validateConnection = validateConnection;
/**
 * Validate the audio filters
 * @param filter The audio filters
 */
function validateFilters(filter) {
    if (filter == null)
        return;
    if (typeof filter !== "object")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "AudioPlayer.filter", typeof filter));
    const filterKeys = Object.keys(filter);
    for (const key of filterKeys) {
        if (!(key in filters))
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotProvided(key, "AudioPlayer.filter"));
        if (typeof filter[key] !== "string")
            throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", `AudioPlayer.filter[${key}]`, typeof filter[key]));
    }
}
exports.validateFilters = validateFilters;
/**
 * Validate the volume
 * @param volume The volume
 */
function validateVolume(volume) {
    if (typeof volume !== "number")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "AudioPlayer.volume", typeof volume));
}
exports.validateVolume = validateVolume;
/**
 * Validate the seconds
 * @param seconds The seconds
 */
function validateSeconds(seconds) {
    if (typeof seconds !== "number")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "AudioPlayer.seconds", typeof seconds));
    if (!Number.isInteger(seconds))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotInteger(seconds));
}
exports.validateSeconds = validateSeconds;
/**
 * Validate the url or location
 * @param urlOrLocation The url or location
 */
function validateUrlOrLocation(urlOrLocation) {
    if (typeof urlOrLocation !== "string")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", "AudioPlayer.urlOrLocation", typeof urlOrLocation));
}
exports.validateUrlOrLocation = validateUrlOrLocation;
/**
 * Validate the source type
 * @param sourceType The source type
 */
function validateSourceType(sourceType) {
    if (typeof sourceType !== "number")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "AudioPlayer.sourceType", typeof sourceType));
    if (!Number.isInteger(sourceType))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotInteger(sourceType));
}
exports.validateSourceType = validateSourceType;
