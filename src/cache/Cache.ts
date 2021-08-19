import type { Resource } from "../util/Resource"

import { opus } from "prism-media"
import { pipeline } from "stream"
import { noop } from "../util/noop"
import { join as pathJoin } from "path"
import { unlink, open } from "fs/promises"
import { CacheReader } from "./CacheReader"
import { mkdirSync, createWriteStream} from "fs"
import { Packet, PacketReader } from "./PacketReader"
import { PlayerError, ErrorMessages, CacheValidation as validation } from "../validation"

/**
 * The options for cache instance
 */
export interface CacheOptions {
  path?: string
  timeout?: number
}

/**
 * The cache instance to manage cache for a source
 */
export class Cache {
  /**
   * The timeout for deleting cache after inactivity
   */
  public timeout: number
  /**
   * The base directory of the cache
   */
  private basePath: string

  /**
   * @internal
   */
  private readonly _dir: string
  /**
   * @internal
   */
  private readonly _timeouts = new Map<string, NodeJS.Timeout>()
  /**
   * @internal
   */
  private readonly _packets = new Map<string, Array<Packet>>()
  /**
   * @internal
   */
  private readonly _resources = new Map<string, Resource>()
  /**
   * @internal
   */
  private readonly _users = new Map<string, number>()

  /**
   * @param dir The directory of the cache
   */
  constructor(dir: string) {
    validation.validateDir(dir)
    this._dir = dir
  }

  /**
   * The full path of base directory and directory
   */
  get path(): string {
    return pathJoin(this.basePath, this._dir)
  }

  /**
   * Set the options for cache
   * @param options The cache options
   */
  setOptions(options: CacheOptions): void {
    validation.validateOptions(options)

    if (options.timeout) this.timeout = options.timeout
    if (options.path) {
      this.basePath = options.path

      mkdirSync(this.path)
    }
  }

  /**
   * Create a new cache
   * @param identifier The audio identifier
   * @param resource The audio resource
   * @returns The OpusEncoder stream to compress and write cache
   */
  create(identifier: string, resource: Resource): opus.Encoder {
    validation.validateIdentifier(identifier)
    validation.validateResource(resource)

    this._checkNotExist(identifier)

    const encoder = new opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 })
    const writeStream = createWriteStream(pathJoin(this.path, identifier), { emitClose: true })

    this._resources.set(identifier, resource)
    this._timeouts.set(identifier, setTimeout(this._deleteCache.bind(this, identifier), this.timeout))
    this._packets.set(identifier, [])
    this._users.set(identifier, 0)

    resource.cacheWriter.on("play", this._addUser.bind(this, identifier))
    resource.cacheWriter.on("stop", this._removeUser.bind(this, identifier))

    writeStream.once("close", () => {
      if (this.hasCache(identifier) && !resource.allCached) {
        if (this._timeouts.has(identifier)) clearTimeout(this._timeouts.get(identifier))
        this._deleteCache(identifier)
      }
    })

    pipeline(encoder, new PacketReader(this._packets.get(identifier)), writeStream, noop)

    return encoder
  }

  /**
   * Read an existing cache
   * @param identifier The audio identifier
   * @param startOnSeconds Start reading cache on specific second of audio
   * @returns The OpusDecoder stream of audio
   */
  read(identifier: string, startOnSeconds = 0): opus.Decoder {
    validation.validateIdentifier(identifier)
    validation.validateSeconds(startOnSeconds)

    this._checkExist(identifier)

    const file = open(pathJoin(this.path, identifier), "r")
    const reader = new CacheReader(this._packets.get(identifier), file, Math.floor(startOnSeconds * 1000))
    const decoder = new opus.Decoder({ rate: 48000, channels: 2, frameSize: 960 })

    this._addUser(identifier)

    reader.once("close", async () => await (await file).close())

    decoder.once("close", () => {
      this._removeUser(identifier)
      reader.destroy()
    })

    pipeline(reader, decoder, noop)

    return decoder
  }

  /**
   * Check if cache exist
   * @param identifier The audio identifier
   * @returns true if exist, otherwise false
   */
  hasCache(identifier: string): boolean {
    validation.validateIdentifier(identifier)
    return this._resources.has(identifier)
  }

  /**
   * Get the audio resource from an existing cache
   * @param identifier The audio identifier
   * @returns The audio resource
   */
  getResource(identifier: string): Resource {
    validation.validateIdentifier(identifier)
    this._checkExist(identifier)

    return this._resources.get(identifier)
  }

  /**
   * @internal
   */
  private _deleteCache(identifier: string): void {
    const writeStream = this._resources.get(identifier).cacheWriter.writeStream

    this._resources.delete(identifier)
    this._timeouts.delete(identifier)
    this._users.delete(identifier)

    if (!writeStream.destroyed) writeStream.destroy()

    unlink(pathJoin(this.path, identifier))
  }

  /**
   * @internal
   */
  private _removeUser(identifier: string): void {
    this._users.set(identifier, this._users.get(identifier)-1)

    if (this._users.get(identifier) <= 0 && !this._timeouts.has(identifier)) this._timeouts.set(identifier, setTimeout(this._deleteCache.bind(this, identifier), this.timeout))
  }

  /**
   * @internal
   */
  private _addUser(identifier: string): void {
    this._users.set(identifier, this._users.get(identifier)+1)

    if (this._timeouts.has(identifier)) {
      clearTimeout(this._timeouts.get(identifier))
      this._timeouts.delete(identifier)
    }
  }

  /**
   * @internal
   */
  private _checkExist(identifier: string): void {
    if (!this.hasCache(identifier)) throw new PlayerError(ErrorMessages.CacheNotExist(identifier))
  }

  /**
   * @internal
   */
  private _checkNotExist(identifier: string): void {
    if (this.hasCache(identifier)) throw new PlayerError(ErrorMessages.CacheAlreadyExist(identifier))
  }
}