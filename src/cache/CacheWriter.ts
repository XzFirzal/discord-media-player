import type { opus } from "prism-media"
import type { Resource } from "../util/Resource"
import type { TransformCallback } from "stream"

import { CacheWriterValidation as validation } from "../validation"
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
  private _cache?: opus.Encoder
  /**
   * @internal
   */
  private _awaitDrain?: TransformCallback

  /**
   * The cache OpusEncoder stream
   */
  get writeStream(): opus.Encoder {
    return this._cache
  }

  /**
   * Set the audio resource
   * @param resource The audio resource
   */
  setResource(resource: Resource): void {
    validation.validateResource(resource)
    this._resource = resource

    if (resource.cache) {
      validation.validateCache(resource.cache)

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
    this._addSecond(chunk.length / Bps)
    this.push(chunk)

    if (this._cache && !this._cache.write(chunk)) {
      this._awaitDrain = cb
    } else cb()
  }

  /**
   * @internal
   */
  _flush(cb: TransformCallback): void {
    this.once("end", () => {
      this._resource.allCached = true
      
      if (this._cache) this._cache?.end()
      else this.destroy()
    })

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