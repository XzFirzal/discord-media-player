"use strict";
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Track = void 0;
const validation_1 = require("../validation");
const kTrack = Symbol("kTrack");
const kPlayer = Symbol("kPlayer");
const kPauses = Symbol("kPauses");
const kUnpauses = Symbol("kUnpauses");
/**
 * Track instance of the raw track
 */
class Track {
    /**
     * @param track The raw track object
     */
    constructor(track) {
        /**
         * @internal
         */
        this[_a] = [];
        /**
         * @internal
         */
        this[_b] = [];
        validation_1.TrackValidation.validateTrack(track);
        this[kTrack] = track;
    }
    /**
     * The track source type
     */
    get sourceType() {
        return this[kTrack].sourceType;
    }
    /**
     * The track url or location
     */
    get urlOrLocation() {
        return this[kTrack].urlOrLocation;
    }
    /**
     * The playback duration of the track (if playing)
     */
    get playbackDuration() {
        return this[kPlayer]?.playbackDuration ?? 0;
    }
    /**
     * The paused duration of the track (if playing and paused atleast once)
     */
    get pausedDuration() {
        let duration = 0;
        for (let index = 0; index < this[kPauses].length; ++index) {
            const pausedStamp = this[kPauses][index];
            const unpausedStamp = this[kUnpauses][index] ?? Date.now();
            duration += unpausedStamp - pausedStamp;
        }
        return duration;
    }
    /**
     * Get value of a track metadata property
     * @param key The metadata property key
     * @returns The metadata property value
     */
    get(key) {
        return this[kTrack].metadata[key];
    }
    /**
     * Set a value to a track metadata property
     * @param key The metadata property key
     * @param value The metadata property value to set
     */
    set(key, value) {
        this[kTrack].metadata[key] = value;
    }
    /**
     * Set the audio player which play the track
     * @param player The audio player
     */
    setPlayer(player) {
        validation_1.TrackValidation.validatePlayer(player);
        this[kPlayer] = player;
    }
    /**
     * Add a pause timestamp when track is paused
     * @param timestamp The timestamp when the track is paused
     */
    addPausedTimestamp(timestamp) {
        validation_1.TrackValidation.validateNumber("pausedTimestamp", timestamp);
        this[kPauses].push(timestamp);
    }
    /**
     * Add a unpause timestamp when track is unpaused
     * @param timestamp The timestamp when the track is unpaused
     */
    addUnpausedTimestamp(timestamp) {
        validation_1.TrackValidation.validateNumber("unpausedTimestamp", timestamp);
        this[kUnpauses].push(timestamp);
    }
    /**
     * Cleanup timestamps after track is stopped playing
     */
    cleanup() {
        this[kPlayer] = null;
        this[kPauses].length = 0;
        this[kUnpauses].length = 0;
    }
}
exports.Track = Track;
_a = kPauses, _b = kUnpauses;
