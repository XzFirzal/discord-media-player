import type { Filters } from "../util/Filters"
import type { AudioPlayer } from "./AudioPlayer"
import type { AudioManager } from "./AudioManager"
import type { SourceType } from "../util/SourceType"
import type { VoiceConnection, VoiceConnectionReadyState, VoiceConnectionState, AudioPlayerPlayingState, AudioPlayerState } from "@discordjs/voice"
import type { Transcoding } from "../soundcloudUtil/transcoding"
import type { TrackInfo } from "soundcloud-downloader/src/info"
import type { Readable, Transform, Duplex } from "stream"
import type { videoFormat, videoInfo } from "ytdl-core"
import type { FileHandle } from "fs/promises"
import type { ReadStream } from "fs"

import prism from "prism-media"
import { noop } from "../util/noop"
import { Skipper } from "../util/Skipper"
import { Resource } from "../util/Resource"
import { ErrorCode } from "../util/ErrorCode"
import { CacheWriter } from "../cache/CacheWriter"
import { downloadMedia } from "../soundcloudUtil/downloadMedia"
import { AudioPlayer as DiscordPlayer, AudioResource, AudioPlayerStatus, VoiceConnectionStatus } from "@discordjs/voice"
import { getVideoID, getInfo, downloadFromInfo } from "ytdl-core"
import { PassThrough, pipeline } from "stream"
import { open as fsOpen } from "fs/promises"
import { createReadStream } from "fs"
import { EventEmitter } from "events"

const FFMPEG_ARGS = [
  "-f",
  "s16le",
  "-ar",
  "48000",
  "-ac",
  "2",
  "-vn"
]

const FILTER_FFMPEG_ARGS = [
  "-f",
  "s16le",
  "-ar",
  "48000",
  "-ac",
  "2",
  "-i",
  "-",
  "-acodec",
  "pcm_s16le",
  "-f",
  "s16le",
  "-ar",
  "48000",
  "-ac",
  "2",
  "-af"
]

/**
 * The default implementation of {@link AudioPlayer | AudioPlayer}
 */
export class AudioPlayerImpl implements AudioPlayer {
  /**
   * @internal
   */
  public manager: AudioManager
  
  /**
   * @internal
   */
  private _info?: videoInfo | TrackInfo
  /**
   * @internal
   */
  private _audio?: CacheWriter | ReadStream | Duplex
  /**
   * @internal
   */
  private _connection?: VoiceConnection
  /**
   * @internal
   */
  private _urlOrLocation?: string
  /**
   * @internal
   */
  private _switchToCache?: number
  /**
   * @internal
   */
  private _resource?: Resource
  /**
   * @internal
   */
  private _sourceType: number
  /**
   * @internal
   */
  private _filters?: Filters

  /**
   * @internal
   */
  private _playResourceOnEnd = false
  /**
   * @internal
   */
  private _disconnected = false
  /**
   * @internal
   */
  private _aborting = false
  /**
   * @internal
   */
  private _stopping = false
  /**
   * @internal
   */
  private _playing = false
  /**
   * @internal
   */
  private _looping = false

  /**
   * @internal
   */
  private _volume = 1

  /**
   * @internal
   */
  private readonly _player = new DiscordPlayer()
  /**
   * @internal
   */
  constructor() {
    this._player.on("stateChange", this._onAudioChange.bind(this))
  }

  /**
   * @internal
   */
  get guildID(): string {
    return this._connection?.joinConfig.guildId
  }

  /**
   * @internal
   */
  get status(): AudioPlayerStatus {
    return this._player.state.status
  }

  /**
   * @internal
   */
  setManager(manager: AudioManager): void {
    this.manager = manager
  }

  /**
   * @internal
   */
  link(connection: VoiceConnection): void {
    if (this._connection) throw new Error("Player is already linked")

    connection.subscribe(this._player)

    this._connection = connection

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const player = this

    function onConnectionChange(oldState: VoiceConnectionState, newState: VoiceConnectionState) {
      const closeOrDestroyed = [VoiceConnectionStatus.Disconnected, VoiceConnectionStatus.Destroyed]

      if (!closeOrDestroyed.includes(oldState.status) && closeOrDestroyed.includes(newState.status)) {
        connection.off("stateChange", onConnectionChange)

        player.manager._deletePlayerIfExist(player.guildID)

        const subscription = (player._connection.state as VoiceConnectionReadyState).subscription

        subscription?.unsubscribe()

        if (player._playing) {
          if (player._resource.player === player && player.manager.cache) player._resource.cacheWriter.unpipe()

          player._disconnected = true
          player._player.stop()
        }

        player._connection = null
        player._cleanup()
      } else if ((oldState as VoiceConnectionReadyState).subscription && !(newState as VoiceConnectionReadyState).subscription) {
        connection.off("stateChange", onConnectionChange)
      }
    }

    connection.on("stateChange", onConnectionChange)
  }

  /**
   * @internal
   */
  unlink(): void {
    if (!this._connection) throw new Error("Player is not linked")

    const subscription = (this._connection.state as VoiceConnectionReadyState).subscription

    subscription?.unsubscribe()

    if (this._playing) {
      if (this._resource.player === this && this.manager.cache) this._resource.cacheWriter.unpipe()

      this._disconnected = true
      this._player.stop()
    }

    this._connection = null
    this._cleanup()
  }

  /**
   * @internal
   */
  setFilter(filter: Filters): void {
    if (!filter || !Object.keys(filter).length) this._filters = null
    else this._filters = filter
  }

  /**
   * @internal
   */
  setVolume(volume: number): void {
    if (typeof volume !== "number") throw new Error(`Expecting 'volume' as number, get '${typeof volume}' instead`)

    this._checkPlaying()
    this._volume = volume

    const audioResource = (this._player.state as AudioPlayerPlayingState).resource

    if (audioResource) audioResource.volume.setVolume(this._volume)
  }

  /**
   * @internal
   */
  stop(): boolean {
    this._checkPlaying()

    if (this._resource.player === this && this.manager.cache) this._resource.cacheWriter.unpipe()

    this._stopping = true
    const stopped = this._player.stop()
    this._stopping = false

    return stopped
  }
  
  /**
   * @internal
   */
  loop(): boolean {
    this._checkPlaying()
    this._looping = !this._looping

    return this._looping
  }

  /**
   * @internal
   */
  pause(pauseOrUnpause?: boolean): boolean {
    this._checkPlaying()

    if ((typeof pauseOrUnpause === "boolean" && pauseOrUnpause === false) ||
      ([AudioPlayerStatus.Paused, AudioPlayerStatus.AutoPaused].includes(this.status) && pauseOrUnpause !== true)) {
      this._player.unpause()
      return false
    }

    return this._player.pause()
  }

  /**
   * @internal
   */
  filter(): void {
    this._checkPlaying()
    
    const player = this._resource.player
    this._abort()

    const audioResource = this._createAudioResource()

    if (player !== this && !this._resource.allCached) this._playResourceOnEnd = true
    if (player === this) this._resource.player = this

    this._player.play(audioResource)
    this._audio.pipe(audioResource.metadata)
  }

  /**
   * @internal
   */
  async seek(seconds: number): Promise<void> {
    seconds = Math.floor(seconds)

    this._checkPlaying()
    if (this._resource.isLive) throw new Error("Livestream cannot be seekened")
    if (seconds > this._resource.cachedSecond && this._resource.allCached) {
      this.stop()
      return
    }

    if (seconds === this._resource.cachedSecond) {
      if (this._resource.player === this) return

      this._playResourceOnEnd = true
      this._player.stop()

      return
    }

    const player = this._resource.player
    this._abort()

    if (seconds < this._resource.cachedSecond && !this.manager.cache) await this._getResource(this._urlOrLocation, this._sourceType)
    if (seconds > this._resource.cachedSecond) {
      const skipper = new Skipper(seconds - this._resource.cachedSecond, this._resource.cacheWriter)

      if (player && player !== this) {
        this._audio.destroy()
        ;(player as AudioPlayerImpl)._switchCache()
      }

      this._resource.cacheWriter.pipe(skipper)

      await new Promise((res) => skipper.once("close", res))

      this._playResource()
    } else this._playCache(seconds)
  }

  /**
   * @internal
   */
  async play(urlOrLocation: string, sourceType: SourceType): Promise<void> {
    if (!this._connection) throw new Error("Player is not linked")
    if (this._playing) throw new Error("Player is already playing")

    await this._getResource(urlOrLocation, sourceType)

    if (!this._resource) return

    this._playing = true
    this._sourceType = sourceType
    this._urlOrLocation = urlOrLocation

    if (this._resource.player === this) this._playResource()
    else this._playCache()

    this.manager.emit("audioStart", this.guildID, urlOrLocation)
  }

  /**
   * @internal
   */
  private _playResource(): void {
    const audioResource = this._createAudioResource()

    this._resource.player = this

    this._audio = this._resource.audio
    this._player.play(audioResource)
    this._audio.pipe(audioResource.metadata)
  }

  /**
   * @internal
   */
  private _playCache(startOnSeconds = 0): void {
    const audioResource = this._createAudioResource()
    const cacheStream = this._resource.cache.read(this._resource.identifier, startOnSeconds)

    this._audio = cacheStream
    this._player.play(audioResource)
    this._audio.pipe(audioResource.metadata)

    if (!this._resource.allCached) this._playResourceOnEnd = true
  }

  /**
   * @internal
   */
  private _createAudioResource(): AudioResource<PassThrough> {
    const streams: (PassThrough | prism.FFmpeg | prism.VolumeTransformer | prism.opus.Encoder)[] = [new prism.VolumeTransformer({
      type: "s16le",
      volume: this._volume
    }), new prism.opus.Encoder({
      rate: 48000,
      channels: 2,
      frameSize: 960
    })]

    if (this._filters) {
      const filters: string[] = []

      Object.entries(this._filters).forEach((filter: [string, string]) => {
        if (!filter[1].length) {
          filters.push(filter[0])
          return
        }

        filters.push(filter.join("="))
      })

      streams.unshift(new prism.FFmpeg({ args: [...FILTER_FFMPEG_ARGS, filters.join(",")] }))
    }

    //Avoid null on _readableState.awaitDrainWriters
    streams.unshift(new PassThrough())

    return new AudioResource([], streams, streams[0] as PassThrough, 0)
  }

  /**
   * @internal
   */
  private _abort(): void {
    this._audio.unpipe()
    this._aborting = true
    this._player.stop()
    this._aborting = false
  }

  /**
   * @internal
   */
  private _checkPlaying(): void {
    if (!this._connection) throw new Error("Player is not linked")
    if (!this._playing) throw new Error("Player is not playing")
  }

  /**
   * @internal
   */
  private async _getResource(urlOrLocation: string, sourceType: number): Promise<void> {
    switch(sourceType) {
      case 0:
        await this._getYoutubeResource(urlOrLocation)
        break
      case 1:
        await this._getSoundcloudResource(urlOrLocation)
        break
      case 2:
        await this._getLocalResource(urlOrLocation)
        break
      default:
        throw new Error(`Invalid source type '${sourceType}'`)
    }
  }

  /**
   * @internal
   */
  private async _getYoutubeResource(url: string): Promise<void> {
    const identifier = getVideoID(url)

    if (this.manager.cache?.youtube.hasCache(identifier)) {
      this._resource = this.manager.cache.youtube.getResource(identifier)
      return
    }

    function getOpusFormat(format: videoFormat) {
      return format.codecs === "opus" &&
        format.container === "webm" &&
        format.audioSampleRate === "48000"
    }

    function getOtherFormat(sourceFormats: videoFormat[], isLive: boolean) {
      function noVideo(format: videoFormat) {
        return !format.hasVideo
      }

      let getFormat = (format: videoFormat) => format.hasAudio

      if (isLive) getFormat = (format: videoFormat) => format.hasAudio && format.isHLS

      const formats = sourceFormats.filter(getFormat)
      const filteredFormat = formats.find(noVideo)

      return filteredFormat || formats[0]
    }

    const options = { highWaterMark: 1 << 22, ...this.manager.youtube }

    let info = this._info as videoInfo

    if (!info) info = await getInfo(url, options)

    const playability = info.player_response?.playabilityStatus

    if (!playability) {
      this.manager.emit("audioError", this.guildID, url, ErrorCode.youtubeNoPlayerResponse)
      return
    } else if (["UNPLAYABLE", "LOGIN_REQUIRED"].includes(playability.status)) {
      let errCode: ErrorCode
        
      switch(playability.status) {
        case "UNPLAYABLE":
          errCode = ErrorCode.youtubeUnplayable
          break
        case "LOGIN_REQUIRED":
          errCode = ErrorCode.youtubeLoginRequired
      }

      this.manager.emit("audioError", this.guildID, url, errCode)
      return
    }

    if (!this.manager.cache && !info.videoDetails.isLiveContent) this._info = info

    async function onPipeAndUnpipe(resource: Resource) {
      const commander = new EventEmitter()
      let contentLength = 0, downloaded = 0

      await new Promise((resolve) => resource.source.once("pipe", resolve))

      resource.source.on("progress", (_: number, audioDownloaded: number, audioLength: number) => {
        downloaded = audioDownloaded
        contentLength = audioLength
      })
      
      resource.source.on("unpipe", async () => {
        if (downloaded >= contentLength) return

        resource.autoPaused = true
        setImmediate(commander.emit.bind(commander, "unpipe"))
      })

      resource.source.on("pipe", async () => {
        await new Promise((resolve) => commander.once("unpipe", resolve))
        
        if (!resource.source.readable || !resource.source.readableFlowing) await new Promise((resolve) => resource.source.once("readable", resolve))

        resource.autoPaused = false
      })
    }

    let format = info.formats.find(getOpusFormat)

    const canDemux = format && !info.videoDetails.isLiveContent

    if (canDemux) {
      options.format = format

      const resource = this._resource = new Resource({
        identifier,
        player: this,
        source: downloadFromInfo(info, options),
        demuxer: new prism.opus.WebmDemuxer(),
        decoder: new prism.opus.Decoder({
          rate: 48000,
          channels: 2,
          frameSize: 960
        }),
        cacheWriter: new CacheWriter(),
        cache: this.manager.cache?.youtube
      })

      pipeline(resource.source, resource.demuxer, resource.decoder, resource.cacheWriter, noop)
      onPipeAndUnpipe(resource)

      resource.cacheWriter.once("close", () => {
        resource.source.destroy()
        resource.demuxer.destroy()
        resource.decoder.destroy()
      })

      return
    }

    format = getOtherFormat(info.formats, info.videoDetails.isLiveContent)

    if (!format) {
      this.manager.emit("audioError", this.guildID, url, ErrorCode.noFormatOrMedia)
      return
    }

    options.format = format

    const resource = this._resource = new Resource({
      identifier,
      player: this,
      source: downloadFromInfo(info, options),
      decoder: new prism.FFmpeg({ args: FFMPEG_ARGS }),
      cacheWriter: info.videoDetails.isLiveContent ? undefined : new CacheWriter(),
      cache: info.videoDetails.isLiveContent ? undefined : this.manager.cache?.youtube
    })

    const lines: (Readable | Duplex | Transform)[] = [resource.source, resource.decoder]

    if (!resource.isLive) lines.push(resource.cacheWriter)

    pipeline(lines, noop)
    onPipeAndUnpipe(resource)

    lines[lines.length-1].once("close", () => lines.forEach((line) => {
      if (!line.destroyed) line.destroy()
    }))
  }

  /**
   * @internal
   */
  private async _getSoundcloudResource(url: string): Promise<void> {
    function getOpusMedia(media: Transcoding[]) {
      return media.find(({ format }) => {
        return format.mime_type === "audio/ogg; codecs=\"opus\""
      })
    }

    let info = this._info as TrackInfo

    if (!info) info = await this.manager.soundcloud.getInfo(url)

    if (!info.media) {
      this.manager.emit("audioError", this.guildID, url, ErrorCode.noFormatOrMedia)
      return
    }

    if (!this.manager.cache) this._info = info

    const identifier = String(info.id)

    if (this.manager.cache?.soundcloud.hasCache(identifier)) {
      this._resource = this.manager.cache.soundcloud.getResource(identifier)
      return
    }

    let transcoding = getOpusMedia(info.media.transcodings)

    if (transcoding) {
      const resource = this._resource = new Resource({
        identifier,
        player: this,
        source: await downloadMedia(transcoding, await this.manager.soundcloud.getClientID(), this.manager.soundcloud.axios),
        demuxer: new prism.opus.OggDemuxer(),
        decoder: new prism.opus.Decoder({
          rate: 48000,
          channels: 2,
          frameSize: 960
        }),
        cacheWriter: new CacheWriter(),
        cache: this.manager.cache?.soundcloud
      })

      pipeline(resource.source, resource.demuxer, resource.decoder, resource.cacheWriter, noop)

      resource.cacheWriter.once("close", () => {
        resource.source.destroy()
        resource.demuxer.destroy()
        resource.decoder.destroy()
      })

      return
    }

    transcoding = info.media.transcodings[0]

    if (!transcoding) {
      this.manager.emit("audioError", this.guildID, url, ErrorCode.noFormatOrMedia)
      return
    }

    const resource = this._resource = new Resource({
      identifier,
      player: this,
      source: await downloadMedia(transcoding, await this.manager.soundcloud.getClientID(), this.manager.soundcloud.axios),
      decoder: new prism.FFmpeg({ args: FFMPEG_ARGS }),
      cacheWriter: new CacheWriter(),
      cache: this.manager.cache?.soundcloud
    })

    pipeline(resource.source, resource.decoder, resource.cacheWriter, noop)

    resource.cacheWriter.once("close", () => {
      resource.source.destroy()
      resource.decoder.destroy()
    })
  }

  /**
   * @internal
   */
  private async _getLocalResource(location: string): Promise<void> {
    let fileHandle: FileHandle

    try {
      fileHandle = await fsOpen(location, "r")
    } catch {
      this.manager.emit("audioError", this.guildID, location, ErrorCode.cannotOpenFile)
      return
    }

    const identifier = await fileHandle.stat({ bigint: true }).then((stat) => String(stat.ino))

    await fileHandle.close()

    if (this.manager.cache?.local.hasCache(identifier)) {
      this._resource = this.manager.cache.local.getResource(identifier)
      return
    }

    const resource = this._resource = new Resource({
      identifier,
      player: this,
      source: createReadStream(location),
      decoder: new prism.FFmpeg({ args: FFMPEG_ARGS }),
      cacheWriter: new CacheWriter(),
      cache: this.manager.cache?.local
    })

    pipeline(resource.source, resource.decoder, resource.cacheWriter, noop)

    resource.cacheWriter.once("close", () => {
      resource.source.destroy()
      resource.decoder.destroy()
    })
  }

  /**
   * @internal
   */
  private async _onAudioChange(oldState: AudioPlayerState, newState: AudioPlayerState): Promise<void> {
    if (oldState.status === AudioPlayerStatus.Paused && newState.status === AudioPlayerStatus.Playing && this._switchToCache) {
      this._playCache(this._switchToCache)
      this._switchToCache = 0
    } else if (oldState.status !== AudioPlayerStatus.Idle && !(newState as AudioPlayerPlayingState).resource) {
      if (!(this._aborting || this._stopping) && this._playResourceOnEnd && !this._resource.allCached) {
        this._playResourceOnEnd = false

        if (this._resource.player && this._resource.player !== this) (this._resource.player as AudioPlayerImpl)._switchCache()

        this._playResource()
        return
      }

      if (this._resource.player === this) {
        if (!this.manager.cache && !this._resource.cacheWriter.destroyed) this._resource.cacheWriter.read()

        this._resource.player = null
      } else this._audio.destroy()

      if (!this._aborting) {
        this._playing = false
        this._playResourceOnEnd = false

        if (!this._disconnected) {
          if (this._resource.isLive) {
            const stopping = this._stopping

            await this._getYoutubeResource(this._urlOrLocation)

            if (this._looping || (this._resource.isLive && !stopping)) {
              if (this._looping && !(this._resource.isLive && !stopping)) {
                this.manager.emit("audioStart", this.guildID, this._urlOrLocation)
                this.manager.emit("audioEnd", this.guildID, this._urlOrLocation)
              }

              this._playing = true
              this._playResource()

              return
            }
          } else if (this._looping) {
            this.manager.emit("audioEnd", this.guildID, this._urlOrLocation)

            if (this.manager.cache) {
              if (this._resource.cacheWriter.destroyed && !this._resource.allCached) {
                this.manager.emit("audioError", this.guildID, this._urlOrLocation, ErrorCode.noResource)
                this._cleanup()

                return
              }

              this._playCache()
            } else {
              await this._getResource(this._urlOrLocation, this._sourceType)

              if (!this._resource) {
                this._cleanup()
                return
              }

              this._playResource()
            }

            this._playing = true
            this.manager.emit("audioStart", this.guildID, this._urlOrLocation)

            return
          }
        }

        this.manager.emit("audioEnd", this.guildID, this._urlOrLocation)
        this._cleanup()
      } else this._playResourceOnEnd = false
    }
  }

  /**
   * @internal
   */
  private _cleanup(): void {
    this._info = null
    this._audio = null
    this._resource = null
    this._sourceType = null
    this._urlOrLocation = null
    this._looping = false
    this._disconnected = false
    this._playResourceOnEnd = false
  }

  /**
   * @internal
   */
  public _switchCache(): void {
    const isPaused = this.status === AudioPlayerStatus.Paused

    this._audio.unpipe()

    const seconds = this._resource.cachedSecond
    setImmediate(() => {
      if (!isPaused) this._playCache(seconds)
      else this._switchToCache = seconds
    })
  }
}