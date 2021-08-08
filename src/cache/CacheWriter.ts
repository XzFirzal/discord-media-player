import type { WriteStream } from "fs"
import type { Resource } from "../util/Resource"
import type { TransformCallback } from "stream"

import { Transform } from "stream"

const Bps = 192000

/**
 * The instance to write audio into cache
 */
export class CacheWriter extends Transform {
  /**
   * @internal
   */
  private _resource: Resource
  /**
   * @internal
   */
  private _cache?: WriteStream
  /**
   * @internal
   */
  private _awaitDrain?: TransformCallback

  /**
   * The cache writable stream
   */
  get writeStream(): WriteStream {
    return this._cache
  }

  /**
   * Set the audio resource
   * @param resource The audio resource
   */
  setResource(resource: Resource): void {
    this._resource = resource

    if (resource.cache) {
      this._cache = resource.cache.create(resource.identifier, resource)
      this._cache.on("drain", () => {
        this._awaitDrain?.()
      })
      this._cache.once("close", () => {
        if (resource.cache.hasCache(resource.identifier)) this.emit("stop")
        this.destroy()
        this._cache.destroy()
      })
    }
  }

  /**
   * @internal
   */
  private _addSecond(seconds): void {
    this._resource.cachedSecond += seconds
  }

  /**
   * @internal
   */
  _transform(chunk: Buffer, _: BufferEncoding, cb: TransformCallback): void {
    this.push(chunk)
    this._addSecond(chunk.length / Bps)

    if (this._cache && !this._cache.write(chunk)) {
      this._awaitDrain = cb
    } else cb()
  }

  /**
   * @internal
   */
  _flush(cb: TransformCallback): void {
    this._resource.allCached = true
    this._cache.end()
    cb()
  }

  /**
   * @internal
   */
  pipe<T extends NodeJS.WritableStream>(destination: T, options?: { end?: boolean }): T {
    this.emit("play")
    return super.pipe(destination, options)
  }
  
  /**
   * @internal
   */
  unpipe<T extends NodeJS.WritableStream>(destination?: T): this {
    this.emit("stop")
    return super.unpipe(destination)
  }
}