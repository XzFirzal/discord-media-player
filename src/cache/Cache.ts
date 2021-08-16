import type { Resource } from "../util/Resource"
import type { ReadStream, WriteStream} from "fs"

import { unlink } from "fs/promises"
import { join as pathJoin } from "path"
import { PlayerError, ErrorMessages, CacheValidation as validation } from "../validation"
import { mkdirSync, createWriteStream, createReadStream } from "fs"

const Bps = 192000

function stableCalculate(seconds: number): number {
  if (!seconds) return 0
  if (Number.isInteger(seconds)) return seconds * Bps

  const base = Math.floor(seconds)
  let result = String(base)

  if (seconds >= base + .9) result += "9"
  else if (seconds >= base + .8) result += "8"
  else if (seconds >= base + .7) result += "7"
  else if (seconds >= base + .6) result += "6"
  else if (seconds >= base + .5) result += "5"
  else if (seconds >= base + .4) result += "4"
  else if (seconds >= base + .3) result += "3"
  else if (seconds >= base + .2) result += "2"
  else if (seconds >= base + .1) result += "1"
  else result += "0"

  return Math.floor((Number(result) * Bps) / 10)
}

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
   * The directory of the cache
   */
  private readonly dir: string
  /**
   * @internal
   */
  private readonly _timeouts = new Map<string, NodeJS.Timeout>()
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
    this.dir = dir
  }

  /**
   * The full path of base directory and directory
   */
  get path(): string {
    return pathJoin(this.basePath, this.dir)
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
   * @returns The writable stream to write cache
   */
  create(identifier: string, resource: Resource): WriteStream | never {
    validation.validateIdentifier(identifier)
    validation.validateResource(resource)

    this._checkNotExist(identifier)

    const writeStream = createWriteStream(pathJoin(this.path, identifier), { emitClose: true })

    this._resources.set(identifier, resource)
    this._timeouts.set(identifier, setTimeout(this._deleteCache.bind(this, identifier), this.timeout))
    this._users.set(identifier, 0)

    resource.cacheWriter.on("play", this._addUser.bind(this, identifier))
    resource.cacheWriter.on("stop", this._removeUser.bind(this, identifier))

    writeStream.once("close", () => {
      if (this.hasCache(identifier) && !resource.allCached) {
        if (this._timeouts.has(identifier)) clearTimeout(this._timeouts.get(identifier))
        this._deleteCache(identifier)
      }
    })

    return writeStream
  }

  /**
   * Read an existing cache
   * @param identifier The audio identifier
   * @param startOnSeconds Start reading cache on specific second of audio
   * @returns The readable stream of audio
   */
  read(identifier: string, startOnSeconds = 0): ReadStream | never {
    validation.validateIdentifier(identifier)
    validation.validateSeconds(startOnSeconds)

    this._checkExist(identifier)

    const readStream = createReadStream(pathJoin(this.path, identifier), { start: stableCalculate(startOnSeconds), emitClose: true })

    this._addUser(identifier)

    readStream.once("close", () => {
      this._removeUser(identifier)
      readStream.destroy()
    })

    return readStream
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
  getResource(identifier: string): Resource | never {
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