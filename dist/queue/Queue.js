"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const validation_1 = require("../validation");
/**
 * Queue instance of tracks to play
 *
 * The current playing track is provided in
 * ```js
 * Queue.current
 * ```
 * and not in
 * ```js
 * Queue[0]
 * ```
 */
class Queue extends Array {
    /**
     * Add some tracks into the queue
     * @param tracks The tracks
     * @returns The queue
     */
    add(tracks) {
        if (Array.isArray(tracks))
            for (const track of tracks) {
                validation_1.QueueValidation.validateTrack(track);
                this.push(track);
            }
        else {
            validation_1.QueueValidation.validateTrack(tracks);
            this.push(tracks);
        }
        return this;
    }
    /**
     * Remove tracks by position in queue (excluding current)
     * @param position Starting position to delete
     * @param howMany How many to delete starting from position
     * @returns The queue
     */
    remove(position, howMany = 1) {
        validation_1.QueueValidation.validateRemove("position", position);
        validation_1.QueueValidation.validateRemove("howMany", howMany);
        this.splice(position, howMany);
        return this;
    }
    /**
     * Progress the first track as current track
     * @returns The queue
     */
    progress() {
        this.current?.cleanup();
        this.current = this.shift();
        return this;
    }
    /**
     * Clear the tracks in the queue
     * @returns The queue
     */
    clear() {
        this.length = 0;
        return this;
    }
}
exports.Queue = Queue;
