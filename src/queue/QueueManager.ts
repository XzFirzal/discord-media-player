/* eslint-disable @typescript-eslint/ban-types */
import type { VoiceConnection } from "@discordjs/voice"
import type { SearchResponseAll } from "soundcloud-downloader/src/search"
import type { TrackInfo as SCDLTrackInfo } from "soundcloud-downloader/src/info"
import type { AudioManagerOptions, AudioManagerEvents } from "../audio/AudioManager"
import type { PlaylistVideo, YoutubeSearchVideoInfo, YoutubeVideoDetails } from "youtube-scrapper"

import { Track } from "./Track"
import { QueueHandler } from "./QueueHandler"
import { TypedEmitter } from "tiny-typed-emitter"
import { AudioManager } from "../audio/AudioManager"
import { QueueManagerValidation as validation } from "../validation"
import { getVideoInfo, getPlaylistInfo, search } from "youtube-scrapper"

/**
 * A RegExp instance to identify youtube playlist url
 */
export const PLAYLIST_URL = /^(?:http|https):\/\/?(?:www\.)?youtube\.com\/playlist\?list=((?:PL|UU|LL|RD|OL)[\w-]{16,41})$/

/**
 * A RegExp instance to identify youtube video url
 */
export const VIDEO_URL = /^(?:http|https):\/\/?(?:(?:www|m)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/)?([\w-]{11})$/

/**
 * Track metadata of youtube search result
 */
export type youtubeMetadata = PlaylistVideo | YoutubeSearchVideoInfo | YoutubeVideoDetails
/**
 * Track metadata of soundcloud search result
 */
export type soundcloudMetadata = SCDLTrackInfo

/**
 * The youtube search result type
 */
export type youtubeSearchResultType = "video" | "playlist" | "search"
/**
 * The soundcloud search result type
 */
export type soundcloudSearchResultType = "track" | "set" | "search"

/**
 * The youtube video types
 */
export interface youtubeVideoType {
  video: YoutubeVideoDetails
  playlist: PlaylistVideo
  search: YoutubeSearchVideoInfo
}

/**
 * The youtube search options
 */
export interface youtubeSearchOptions {
  query: string
  fullPlaylist?: boolean
}

/**
 * The soundcloud search options
 */
export interface soundcloudSearchOptions {
  query: string
  searchLimit?: number
  searchOffset?: number
  setLimit?: number
}

/**
 * The youtube search result
 */
export interface youtubeSearchResult<T extends youtubeSearchResultType> {
  type: T,
  tracks: Track<youtubeVideoType[T]>[]
}

/**
 * The soundcloud search result
 */
export interface soundcloudSearchResult {
  type: soundcloudSearchResultType,
  tracks: Track<soundcloudMetadata>[]
}

/**
 * The AudioManager-like that can be passed to queue manager
 */
export type AudioManagerResolvable = AudioManager | AudioManagerOptions

export interface QueueManagerEvents {
  /**
   * {@link AudioManagerEvents.audioStart | AudioStartCallback}
   */
  audioStart: AudioManagerEvents["audioStart"]
  /**
   * {@link AudioManagerEvents.audioEnd | AudioEndCallback}
   */
  audioEnd: AudioManagerEvents["audioEnd"]
  /**
   * {@link AudioManagerEvents.audioError | AudioErrorCallback}
   */
  audioError: AudioManagerEvents["audioError"]
  /**
   * @param guildID The guildID of the linked connection in queue player
   */
  queueStart(guildID: string): void
  /**
   * @param guildID The guildID of the linked connection in queue player
   */
  queueEnd(guildID: string): void
}

/**
 * The manager of queue handler
 * 
 * Example:
 * ```ts
 * import { QueueManager, CacheManagerImpl, youtubeMetadata, soundcloudMetadata } from "discord-media-player"
 * const manager = new QueueManager<youtubeMetadata | soundcloudMetadata>({
 *   //cache is optional
 *   cache: new CacheManagerImpl()
 * })
 * ...
 * ```
 */
export class QueueManager<TM extends object = {}, M = unknown> extends TypedEmitter<QueueManagerEvents> {
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
   * Emitted whenever a queue is starting to play audio
   * 
   * Listener must implement {@link QueueManagerEvents.queueStart | QueueStartCallback}
   * @event
   */
  static QUEUE_START = "queueStart"

  /**
   * Emitted whenever a queue is ended
   * 
   * Listener must implement {@link QueueManagerEvents.queueEnd | QueueEndCallback}
   * @event
   */
  static QUEUE_END = "queueEnd"

  /**
   * The audio manager of the queue
   */
  public readonly audioManager: AudioManager
  /**
   * The queue manager metadata (if any)
   */
  public readonly metadata?: M

  /**
   * @internal
   */
  private _handlers = new Map<string, QueueHandler<TM>>()

  /**
   * @param manager The audio manager resolvable
   */
  constructor(manager: AudioManagerResolvable, metadata?: M) {
    super()
    validation.validateAudioManager(manager as AudioManager)

    this.metadata = metadata

    if (manager instanceof AudioManager) this.audioManager = manager
    else this.audioManager = new AudioManager(manager)

    this.audioManager.on("audioStart", this.emit.bind(this, "audioStart"))
    this.audioManager.on("audioEnd", this.emit.bind(this, "audioEnd"))
    this.audioManager.on("audioError", this.emit.bind(this, "audioError"))
  }

  /**
   * Get queue handler from list if exist, otherwise create new
   * @param connection The voice connection
   * @returns The queue handler
   */
  getHandler(connection: VoiceConnection): QueueHandler<TM> {
    validation.validateConnection(connection)

    const guildID = connection.joinConfig.guildId

    let handler = this._handlers.get(guildID)

    if (!handler) {
      const player = this.audioManager.getPlayer(connection)
      handler = new QueueHandler(this, player)

      this._handlers.set(guildID, handler)
    }

    return handler
  }

  /**
   * Delete queue handler from list
   * @param connection The voice connection
   * @returns false if failed or doesn't exist, true if deleted
   */
  deleteHandler(connection: VoiceConnection): boolean {
    validation.validateConnection(connection)

    const guildID = connection.joinConfig.guildId

    if (!this._handlers.has(guildID)) return false

    const success = this._handlers.delete(guildID)

    if (success) this.audioManager.deletePlayer(connection)

    return success
  }

  /**
   * @internal
   */
  _deleteHandlerIfExist(guildID: string): void {
    if (this._handlers.has(guildID)) this._handlers.delete(guildID)
  }

  /**
   * Search for a youtube track
   * @param options The youtube search options
   * @returns The youtube search result
   */
  async youtubeSearch(options: youtubeSearchOptions): Promise<youtubeSearchResult<youtubeSearchResultType>> {
    validation.validateYoutubeSearchOptions(options)

    const tracks: Track<youtubeMetadata>[] = []
    const type: youtubeSearchResultType = PLAYLIST_URL.test(options.query)
      ? "playlist"
      : VIDEO_URL.test(options.query)
      ? "video"
      : "search"

    if (type === "video") {
      const videoID = VIDEO_URL.exec(options.query)[1]
      const { details } = await getVideoInfo(`https://www.youtube.com/watch?v=${videoID}`)

      tracks.push(new Track({
        sourceType: 0,
        urlOrLocation: details.url,
        metadata: details
      }))
    } else if (type === "playlist") {
      const playlistID = PLAYLIST_URL.exec(options.query)[1]
      const playlist = await getPlaylistInfo(`https://www.youtube.com/playlist?list=${playlistID}`, { full: options.fullPlaylist ?? false })

      for (const video of playlist.tracks) {
        tracks.push(new Track({
          sourceType: 0,
          urlOrLocation: video.url,
          metadata: video
        }))
      }
    } else {
      const searchResult = await search(options.query)

      for (const video of searchResult.videos) {
        tracks.push(new Track({
          sourceType: 0,
          urlOrLocation: video.url,
          metadata: video
        }))
      }
    }

    return { type, tracks }
  }

  /**
   * Search for a soundcloud track
   * @param options The soundcloud search options
   * @returns The soundcloud search result
   */
  async soundcloudSearch(options: soundcloudSearchOptions): Promise<soundcloudSearchResult> {
    validation.validateSoundcloudSearchOptions(options)

    const { soundcloud } = this.audioManager
    const tracks: Track<soundcloudMetadata>[] = []
    const type: soundcloudSearchResultType = soundcloud.isPlaylistURL(options.query)
      ? "set"
      : soundcloud.isValidUrl(options.query)
      ? "track"
      : "search"
    
    if (type === "track") {
      const track = await soundcloud.getInfo(options.query)

      tracks.push(new Track({
        sourceType: 1,
        urlOrLocation: track.permalink_url,
        metadata: track
      }))
    } else if (type === "set") {
      const set = await soundcloud.getSetInfo(options.query)

      for (const track of set.tracks) {
        if (tracks.length >= options.setLimit) break

        tracks.push(new Track({
          sourceType: 1,
          urlOrLocation: track.permalink_url,
          metadata: track
        }))
      }
    } else {
      const searchResult = await soundcloud.search({
        query: options.query,
        limit: options.searchLimit ?? 1,
        offset: options.searchOffset ?? 0
      })

      // eslint-disable-next-line no-inner-declarations
      async function getNext(searchResponse: SearchResponseAll) {
        for (const track of searchResponse.collection) {
          if (tracks.length >= options.searchLimit) break

          tracks.push(new Track({
            sourceType: 1,
            urlOrLocation: track.permalink_url,
            metadata: track as soundcloudMetadata
          }))
        }

        if (tracks.length < options.searchLimit && searchResponse.next_href) await getNext(await soundcloud.search({
          nextHref: searchResponse.next_href
        }))
      }

      await getNext(searchResult)
    }

    return { type, tracks }
  }
}