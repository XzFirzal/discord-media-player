import type { Filters } from "../util/Filters"
import type { QueueManager } from "./QueueManager"
import type { AudioPlayer } from "../audio/AudioPlayer"
import type { AudioPlayerStatus } from "@discordjs/voice"

import { Queue } from "./Queue"
import { PlayerError, ErrorMessages, QueueHandlerValidation as validation } from "../validation"

type VOID = () => void

/**
 * The instance to handle audio player and queue
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export class QueueHandler<TM extends object = {}> {
  /**
   * The manager of the queue handler
   */
  public readonly manager: QueueManager<TM>
  /**
   * The handled queue
   */
  public readonly queue = new Queue<TM>()

  /**
   * @internal
   */
  private _player: AudioPlayer

  /**
   * @internal
   */
  private _onend: VOID
  /**
   * @internal
   */
  private _onpause: VOID
  /**
   * @internal
   */
  private _onunpause: VOID

  /**
   * @internal
   */
  private _looping = false
  /**
   * @internal
   */
  private _loopQueue = false
  /**
   * @internal
   */
  private _paused = false
  /**
   * @internal
   */
  private _filtered = false
  /**
   * @internal
   */
  private _volume = 1

  /**
   * @param manager The queue manager
   * @param player The handled audio player
   */
  constructor(manager: QueueManager<TM>, player: AudioPlayer) {
    validation.validateManager(manager)
    validation.validatePlayer(player)

    this.manager = manager
    this._player = player
    this._player.once("unlink", this._onUnlink.bind(this))
  }

  /**
   * The player linked connection guildID
   */
  get guildID(): string {
    return this._player.guildID
  }

  /**
   * The audio player status
   */
  get status(): AudioPlayerStatus {
    return this._player.status
  }

  /**
   * The audio player is playing or not
   */
  get playing(): boolean {
    return this._player.playing
  }

  /**
   * The audio volume
   */
  get volume(): number {
    return this._volume
  }

  /**
   * The audio player is looping the current audio or not
   */
  get looping(): boolean {
    return this._looping
  }

  /**
   * The queue is looped or not
   */
  get queueLooping(): boolean {
    return this._loopQueue
  }

  /**
   * The current track is paused or not
   */
  get paused(): boolean {
    return this._paused
  }

  /**
   * The audio is filtered or not
   */
  get filtered(): boolean {
    return this._filtered
  }

  /**
   * Set the volume of the audio
   * @param volume The volume
   */
  setVolume(volume: number): void {
    this._player.setVolume(volume)
    this._volume = volume
  }

  /**
   * Loop the current audio
   * @returns true if looping, otherwise false
   */
  loop(): boolean {
    this._looping = this._player.loop()
    return this._looping
  }

  /**
   * Loop the queue
   * @returns true if looping, otherwise false
   */
  loopQueue(): boolean {
    this._checkPlaying()
    this._loopQueue = !this._loopQueue
    return this._loopQueue
  }

  /**
   * Pause the current track
   * @returns true if paused, otherwise false
   */
  pause(): boolean {
    this._paused = this._player.pause()
    return this._paused
  }

  /**
   * Filter the audio
   * @param filters The filters (ffmpeg-audiofilters)
   */
  filter(filters: Filters): void {
    this._player.setFilter(filters)
    this._player.filter()
    this._filtered = true
  }

  /**
   * If the audio is filtered, unfilter the audio
   */
  unfilter(): void {
    if (!this._filtered) return

    this._player.setFilter(null)
    this._player.filter()
    this._filtered = false
  }

  /**
   * Stop the current track
   */
  stop(): void {
    this._player.stop()
  }

  /**
   * Seek into specific duration of the current track
   * @param seconds Where to seek (in seconds)
   */
  seek(seconds: number): Promise<void> {
    return this._player.seek(seconds)
  }

  /**
   * Start the queue cycle
   */
  async play(): Promise<void> {
    if (this.playing) return
    this._checkQueueEmpty()

    this._attachListener()
    this.manager.emit("queueStart", this.guildID)
    await this._onend()
  }

  /**
   * @internal
   */
  private _attachListener(): void {
    this._detachListener()

    this._onend = this._onEnd.bind(this)
    this._onpause = this._onPause.bind(this)
    this._onunpause = this._onUnpause.bind(this)

    this._player.on("end", this._onend)
    this._player.on("pause", this._onpause)
    this._player.on("unpause", this._onunpause)
  }

  /**
   * @internal
   */
  private _detachListener(): void {
    if (this._onend) this._player.off("end", this._onend)
    if (this._onpause) this._player.off("pause", this._onpause)
    if (this._onunpause) this._player.off("unpause", this._onunpause)

    this._onend = null
    this._onpause = null
    this._onunpause = null
  }

  /**
   * @internal
   */
  private async _onEnd(): Promise<void> {
    this.queue.current?.cleanup()

    if (this.queue.current) {
      if (this.looping) {
        this.queue.current.setPlayer(this._player)
        return
      } else if (this.queueLooping) this.queue.add(this.queue.current)
    }

    const track = this.queue.progress().current

    if (!track) {
      this._detachListener()
      this.manager.emit("queueEnd", this.guildID)
      return
    }

    await this._player.play(track.urlOrLocation, track.sourceType)
    track.setPlayer(this._player)
  }

  /**
   * @internal
   */
  private _onPause(): void {
    this.queue.current?.addPausedTimestamp(Date.now())
  }

  /**
   * @internal
   */
  private _onUnpause(): void {
    this.queue.current?.addUnpausedTimestamp(Date.now())
  }

  /**
   * @internal
   */
  private _onUnlink(): void {
    this.manager._deleteHandlerIfExist(this.guildID)
    this._cleanup()
  }

  /**
   * @internal
   */
  private _cleanup(): void {
    if (this.playing) this.manager.emit("queueEnd", this.guildID)

    this._detachListener()
    this.queue.clear()
    this._player = null
  }

  /**
   * @internal
   */
  private _checkPlaying(): void {
    if (!this._player.playing) throw new PlayerError(ErrorMessages.PlayerNotPlaying)
  }

  /**
   * @internal
   */
  private _checkQueueEmpty(): void {
    if (this.queue.length <= 0) throw new PlayerError(ErrorMessages.QueueEmpty)
  }
}