import type { ErrorCode } from "../util/ErrorCode"
import type { CacheManager } from "../cache/CacheManager"
import type { VoiceConnection } from "@discordjs/voice"
import type { downloadOptions } from "ytdl-core"
import type { AudioPlayer } from "./AudioPlayer"

import SCDL from "soundcloud-downloader"
import { mkdirSync, mkdtempSync, existsSync } from "fs"
import { AudioPlayerImpl } from "./AudioPlayerImpl"
import { join as pathJoin } from "path"
import { EventEmitter } from "events"
import { fork } from "child_process"
import { tmpdir } from "os"

function initCache(dir: string): void {
  if (!existsSync(dir)) mkdirSync(dir)
}

type createAudioPlayerType = (manager: AudioManager) => AudioPlayer

function defaultCreateAudioPlayerType(manager: AudioManager): AudioPlayer {
  const player = new AudioPlayerImpl()
  player.setManager(manager)

  return player
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
  audioStart(guildID: string, urlOrLocation: string): void
  audioEnd(guildID: string, urlOrLocation: string): void
  audioError(guildID: string, urlOrLocation: string, errorCode: ErrorCode): void
}

export interface AudioManager extends EventEmitter {
  on<E extends keyof AudioManagerEvents>(
    event: E, listener: AudioManagerEvents[E]
  ): this
  once<E extends keyof AudioManagerEvents>(
    event: E, listener: AudioManagerEvents[E]
  ): this
  addListener<E extends keyof AudioManagerEvents>(
    event: E, listener: AudioManagerEvents[E]
  ): this

  off<E extends keyof AudioManagerEvents>(
    event: E, listener: AudioManagerEvents[E]
  ): this
  removeListener<E extends keyof AudioManagerEvents>(
    event: E, listener: AudioManagerEvents[E]
  ): this

  emit<E extends keyof AudioManagerEvents>(
    event: E, ...args: Parameters<AudioManagerEvents[E]>
  ): boolean
}

/**
 * The manager of the audio players
 */
export class AudioManager extends EventEmitter {
  /**
   * The audio cache manager
   */
  public readonly cache?: CacheManager
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
   * @param param0 The options to create new audio player manager
   */
  constructor({ cache, cacheDir, youtubeOptions, soundcloudClient, createAudioPlayer }: AudioManagerOptions) {
    super()

    this.cache = cache
    this.youtube = youtubeOptions ?? {}
    this.soundcloud = soundcloudClient ?? SCDL

    this._createAudioPlayer = createAudioPlayer || defaultCreateAudioPlayerType

    if (cache) {
      const path = cacheDir ?? tmpdir()

      initCache(path)
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
    const guildID = connection.joinConfig.guildId

    let player = this._players.get(guildID)

    if (!player) {
      player = this._createAudioPlayer(this)

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