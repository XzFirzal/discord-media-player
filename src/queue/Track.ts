/* eslint-disable @typescript-eslint/ban-types */
import type { AudioPlayer } from "../audio/AudioPlayer"
import { TrackValidation as validation } from "../validation"

const kTrack = Symbol("kTrack")
const kPlayer = Symbol("kPlayer")
const kPauses = Symbol("kPauses")
const kUnpauses = Symbol("kUnpauses")

/**
 * Raw object of the track
 */
export interface TrackResolvable<TM extends object = {}> {
  sourceType: number,
  urlOrLocation: string,
  metadata?: TM
}

/**
 * Track instance of the raw track
 */
export class Track<TM extends object = {}> {
  /**
   * @internal
   */
  private [kTrack]: TrackResolvable<TM>
  /**
   * @internal
   */
  private [kPlayer]: AudioPlayer
  /**
   * @internal
   */
  private [kPauses]: number[] = []
  /**
   * @internal
   */
  private [kUnpauses]: number[] = []

  /**
   * @param track The raw track object
   */
  constructor(track: TrackResolvable<TM>) {
    validation.validateTrack(track)
    this[kTrack] = track
  }

  /**
   * The track source type
   */
  get sourceType(): number {
    return this[kTrack].sourceType
  }

  /**
   * The track url or location
   */
  get urlOrLocation(): string {
    return this[kTrack].urlOrLocation
  }

  /**
   * The playback duration of the track (if playing)
   */
  get playbackDuration(): number {
    return this[kPlayer]?.playbackDuration ?? 0
  }

  /**
   * The paused duration of the track (if playing and paused atleast once)
   */
  get pausedDuration(): number {
    let duration = 0

    for (let index = 0; index < this[kPauses].length; ++index) {
      const pausedStamp = this[kPauses][index]
      const unpausedStamp = this[kUnpauses][index] ?? Date.now()

      duration += unpausedStamp - pausedStamp
    }

    return duration
  }

  /**
   * Get value of a track metadata property
   * @param key The metadata property key
   * @returns The metadata property value
   */
  get<K extends keyof TM>(key: K): TM[K] {
    return this[kTrack].metadata[key]
  }

  /**
   * Set a value to a track metadata property
   * @param key The metadata property key
   * @param value The metadata property value to set
   */
  set<K extends keyof TM, V extends TM[K]>(key: K, value: V): void {
    this[kTrack].metadata[key] = value
  }

  /**
   * Set the audio player which play the track
   * @param player The audio player
   */
  setPlayer(player: AudioPlayer): void {
    validation.validatePlayer(player)
    this[kPlayer] = player
  }

  /**
   * Add a pause timestamp when track is paused
   * @param timestamp The timestamp when the track is paused
   */
  addPausedTimestamp(timestamp: number): void {
    validation.validateNumber("pausedTimestamp", timestamp)
    this[kPauses].push(timestamp)
  }

  /**
   * Add a unpause timestamp when track is unpaused
   * @param timestamp The timestamp when the track is unpaused
   */
  addUnpausedTimestamp(timestamp: number): void {
    validation.validateNumber("unpausedTimestamp", timestamp)
    this[kUnpauses].push(timestamp)
  }

  /**
   * Cleanup timestamps after track is stopped playing
   */
  cleanup(): void {
    this[kPlayer] = null
    this[kPauses].length = 0
    this[kUnpauses].length = 0
  }
}