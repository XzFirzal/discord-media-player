import type { ErrorCode } from "../util/ErrorCode"
import type { CacheManager } from "../cache/CacheManager"
import type { VoiceConnection } from "@discordjs/voice"
import type { downloadOptions } from "ytdl-core"
import type { AudioPlayer } from "./AudioPlayer"

import SCDL from "soundcloud-downloader"
import { AudioManagerValidation as validation } from "../validation"
import { mkdirSync, mkdtempSync, existsSync } from "fs"
import { AudioPlayerImpl } from "./AudioPlayerImpl"
import { TypedEmitter } from "tiny-typed-emitter"
import { join as pathJoin } from "path"
import { fork } from "child_process"
import { tmpdir } from "os"

function initCache(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir)
}

type createAudioPlayerType = () => AudioPlayer

function defaultCreateAudioPlayerType(): AudioPlayer {
  return new AudioPlayerImpl()
}

/**
 * The options for AudioManager
 */
export interface AudioManagerOptions {
  /**
   * The audio cache manager
   */
  cache?: CacheManager
  /**
   * The directory where the audio cache is saved
   */
  cacheDir?: string
  /**
   * The timeout for cache deletion (in ms)
   */
  cacheTimeout?: number
  /**
   * Abort the player after reaching timeout on buffering (in ms), default to 7 seconds
   */
  playTimeout?: number
  /**
   * The downloadOptions (ytdl-core) when getting audio source from youtube
   */
  youtubeOptions?: downloadOptions
  /**
   * The soundcloud client (soundcloud-downloader) when getting audio source from soundcloud
   */
  soundcloudClient?: typeof SCDL
  /**
   * Custom method for creating audio player implementation
   */
  createAudioPlayer?: createAudioPlayerType
}

export interface AudioManagerEvents {
  /**
   * @param guildID The guildID of the linked connection in player
   * @param urlOrLocation The audio url or location
   */
  audioStart(guildID: string, urlOrLocation: string): void
  /**
   * @param guildID The guildID of the linked connection in player
   * @param urlOrLocation The audio url or location
   */
  audioEnd(guildID: string, urlOrLocation: string): void
  /**
   * @param guildID The guildID of the linked connection in player
   * @param urlOrLocation The audio url or location
   * @param errorCode The error code to identify error
   */
  audioError(guildID: string, urlOrLocation: string, errorCode: ErrorCode): void
}

/**
 * The manager of the audio players
 */
export class AudioManager extends TypedEmitter<AudioManagerEvents> {
  /**
   * Emitted whenever an audio is started playing
   * 
   * Listener must implement {@link AudioManagerEvents.audioStart | AudioStartCallback}
   * @event
   */
  static AUDIO_START = "audioStart"

  /**
   * Emitted whenever an audio is ended after playing
   * 
   * Listener must implement {@link AudioManagerEvents.audioEnd | AudioEndCallback}
   * @event
   */
  static AUDIO_END = "audioEnd"

  /**
   * Emitted whenever an error is thrown while getting audio source before playing
   * 
   * Listener must implement {@link AudioManagerEvents.audioError | AudioErrorCallback}
   * @event
   */
  static AUDIO_ERROR = "audioError"

  /**
   * The audio cache manager
   */
  public readonly cache?: CacheManager
  /**
   * Abort the player after reaching timeout on buffering (in ms), default to 7 seconds
   */
  public readonly playTimeout?: number
  /**
   * The soundcloud client (soundcloud-downloader) when getting audio source
   */
  public readonly soundcloud: typeof SCDL
  /**
   * The downloadOptions (ytdl-core) when getting audio source
   */
  public readonly youtube: downloadOptions
  
  /**
   * @internal
   */
  private readonly _players = new Map<string, AudioPlayer>()
  /**
   * @internal
   */
  private readonly _createAudioPlayer: createAudioPlayerType

  /**
   * @param options The options to create new audio player manager
   */
  constructor(options: AudioManagerOptions) {
    super()
    validation.validateOptions(options)

    const { cache, cacheDir, cacheTimeout, playTimeout, youtubeOptions, soundcloudClient, createAudioPlayer } = options

    this.cache = cache
    this.playTimeout = playTimeout ?? 7 * 1000
    this.youtube = youtubeOptions ?? {}
    this.soundcloud = soundcloudClient ?? SCDL

    this._createAudioPlayer = createAudioPlayer || defaultCreateAudioPlayerType

    if (cache) {
      const path = cacheDir ?? tmpdir()
      const timeout = cacheTimeout ?? 1000 * 60 * 10

      initCache(path)
      cache.setTimeout(timeout)
      cache.setPath(mkdtempSync(pathJoin(path, "node-discord-media-player-")))

      const daemon = fork(require.resolve("../nodeDeleteDaemon"), { detached: true })
      daemon.send(process.pid)
      daemon.send(cache.path)
      daemon.unref()
    }
  }

  /**
   * Get player from list if exist, otherwise create new
   * @param connection The voice connection
   * @returns The audio player
   */
  getPlayer(connection: VoiceConnection): AudioPlayer {
    validation.validateConnection(connection)

    const guildID = connection.joinConfig.guildId

    let player = this._players.get(guildID)

    if (!player) {
      player = this._createAudioPlayer()
      validation.validatePlayer(player)

      player.setManager(this)
      player.link(connection)

      this._players.set(guildID, player)
    }

    return player
  }

  /**
   * Delete player from list and unlink it
   * @param connection The voice connection
   * @returns false if failed or doesn't exist, true if deleted
   */
  deletePlayer(connection: VoiceConnection): boolean {
    validation.validateConnection(connection)

    const guildID = connection.joinConfig.guildId

    if (!this._players.has(guildID)) return false

    const player = this._players.get(guildID)
    const success = this._players.delete(guildID)

    if (success) player.unlink()

    return success
  }

  /**
   * @internal
   */
  _deletePlayerIfExist(guildID: string): void {
    if (this._players.has(guildID)) this._players.delete(guildID)
  }
}