/* eslint-disable @typescript-eslint/ban-types */
import type { Track } from "./Track"
import { QueueValidation as validation } from "../validation"

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
export class Queue<TM extends object> extends Array<Track<TM>> {
  /**
   * The current playing track
   */
  public current?: Track<TM>

  /**
   * Add some tracks into the queue
   * @param tracks The tracks
   * @returns The queue
   */
  add(tracks: Track<TM> | Track<TM>[]): this {
    if (Array.isArray(tracks)) for (const track of tracks) {
      validation.validateTrack(track)
      this.push(track)
    } else {
      validation.validateTrack(tracks)
      this.push(tracks)
    }

    return this
  }

  /**
   * Remove tracks by position in queue (excluding current)
   * @param position Starting position to delete
   * @param howMany How many to delete starting from position
   * @returns The queue
   */
  remove(position: number, howMany = 1): this {
    validation.validateRemove("position", position)
    validation.validateRemove("howMany", howMany)

    this.splice(position, howMany)
    return this
  }

  /**
   * Progress the first track as current track
   * @returns The queue
   */
  progress(): this {
    this.current?.cleanup()
    this.current = this.shift()

    return this
  }

  /**
   * Clear the tracks in the queue
   * @returns The queue
   */
  clear(): this {
    this.length = 0
    return this
  }
}