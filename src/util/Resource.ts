import type { Cache } from "../cache/Cache"
import type { CacheWriter } from "../cache/CacheWriter"
import type { AudioPlayer } from "../audio/AudioPlayer"
import type { Readable, Transform, Duplex } from "stream"
import { ResourceValidation as validation } from "../validation"
import { AudioPlayerStatus } from "@discordjs/voice"

/**
 * Options for making audio resource
 */
export interface ResourceOptions {
  /**
   * The audio player that create the audio resource
   */
  player: AudioPlayer,
  /**
   * The audio identifier
   */
  identifier: string,
  /**
   * The audio decoder
   */
  decoder: Transform | Duplex,
  /**
   * The audio source
   */
  source: Readable,
  /**
   * The audio cache writer
   */
  cacheWriter: CacheWriter,
  /**
   * The cache instance of audio source
   */
  cache?: Cache,
  /**
   * true if the audio source is livestream, otherwise false
   */
  isLive?: boolean,
  /**
   * The audio demuxer
   */
  demuxer?: Transform
}

/**
 * The audio resource instance
 */
export class Resource {
  /**
   * The audio cached in seconds
   */
  public cachedSecond = 0
  /**
   * true if all audio is cached, otherwise false
   */
  public allCached = false

  /**
   * The audio player that currently use the audio resource
   */
  private _player: AudioPlayer
  /**
   * If audio source is from youtube, it will auto paused when ytdl-core getting next chunk
   */
  private _autoPaused = false
  /**
   * true if the audio source is livestream, otherwise false
   */
  public readonly isLive: boolean
  /**
   * The audio identifier
   */
  public readonly identifier: string
  /**
   * The audio decoder
   */
  public readonly decoder: Transform | Duplex
  /**
   * The audio source
   */
  public readonly source: Readable
  /**
   * The cache instance of audio source
   */
  public readonly cache?: Cache
  /**
   * The audio demuxer
   */
  public readonly demuxer?: Transform
  /**
   * The audio cache writer
   */
  public readonly cacheWriter?: CacheWriter

  /**
   * @param options The options to create audio resource
   */
  constructor(options: ResourceOptions) {
    validation.validateOptions(options)
    const { player, identifier, decoder, source, cache, isLive, demuxer, cacheWriter } = options

    this.player = player
    this.identifier = identifier
    this.cache = cache
    this.source = source
    this.demuxer = demuxer
    this.decoder = decoder
    this.cacheWriter = cacheWriter
    this.isLive = isLive ?? false

    cacheWriter.setResource(this)
  }

  set player(player: AudioPlayer) {
    if (player != null) validation.validatePlayer(player)
    this._player = player

    setImmediate(() => {
      if (this.autoPaused && ![AudioPlayerStatus.Paused, AudioPlayerStatus.AutoPaused].includes(player?.status)) player?.pause(true)
    })
  }

  get player(): AudioPlayer {
    return this._player
  }

  set autoPaused(paused: boolean) {
    validation.validatePaused(paused)
    this._autoPaused = paused

    if (paused && ![AudioPlayerStatus.Paused, AudioPlayerStatus.AutoPaused].includes(this.player?.status)) this.player?.pause(true)
    else if (!paused && [AudioPlayerStatus.Paused, AudioPlayerStatus.AutoPaused].includes(this.player?.status)) this.player?.pause(false)
  }

  get autoPaused(): boolean {
    return this._autoPaused
  }
}