import type { CacheWriter } from "../cache/CacheWriter"
import { Writable } from "stream"

const Bps = 192000

/**
 * The instance for skipping the audio
 */
export class Skipper extends Writable {
  /**
   * @internal
   */
  private _bytes: number

  /**
   * @param seconds The amount to skip in second
   * @param _cacheWriter The audio cache writer
   */
  constructor(seconds: number, private readonly _cacheWriter: CacheWriter) {
    super()

    this._bytes = Bps * seconds
  }

  /**
   * @internal
   */
  _write(chunk: Buffer, _: BufferEncoding, cb: () => void): void {
    this._bytes -= chunk.length

    if (this._bytes <= 0) {
      this._cacheWriter.unpipe()
      this.destroy()
    }

    cb()
  }

  /**
   * @internal
   */
  _final(cb: () => void): void {
    this._cacheWriter.unpipe()
    this.destroy()

    cb()
  }
}