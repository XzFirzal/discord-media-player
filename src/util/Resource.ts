import type { Cache } from "../cache/Cache"
import type { CacheWriter } from "../cache/CacheWriter"
import type { AudioPlayer } from "../audio/AudioPlayer"
import type { Readable, Transform, Duplex } from "stream"

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
   * The cache instance of audio source
   */
  cache?: Cache,
  /**
   * The audio demuxer
   */
  demuxer?: Transform
  /**
   * The audio cache writer
   */
  cacheWriter?: CacheWriter
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
  public player: AudioPlayer

  /**
   * true if the audio source is livestream, otherwise false
   */
  public readonly isLive: boolean
  /**
   * The audio identifier
   */
  public readonly identifier: string
  /**
   * The end of the audio resource pipeline
   */
  public readonly audio: CacheWriter | Duplex
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
   * @param param0 The options to create audio resource
   */
  constructor({ player, identifier, decoder, source, cache, demuxer, cacheWriter }: ResourceOptions) {
    this.player = player
    this.identifier = identifier
    this.cache = cache
    this.source = source
    this.demuxer = demuxer
    this.decoder = decoder

    if (cacheWriter) {
      this.audio = cacheWriter
      this.cacheWriter = cacheWriter
      cacheWriter.setResource(this)
    } else this.audio = this.decoder as Duplex

    this.isLive = !cacheWriter
  }
}