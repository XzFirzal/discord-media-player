import type { Packet } from "./PacketReader"
import type { FileHandle } from "fs/promises"

import { Readable } from "stream"
import { CacheReaderValidation as validation } from "../validation"

const frameSize = 20

/**
 * An instance to appropriately read opus packet
 */
export class CacheReader extends Readable {
  /**
   * How many packets has been read (in ms)
   */
  public packetRead = 0

  /**
   * @internal
   */
  private readonly _packets: Array<Packet>
  /**
   * @internal
   */
  private readonly _ms: number

  /**
   * @internal
   */
  private _file: Promise<FileHandle> | FileHandle
  /**
   * @internal
   */
  private _position = -1
  /**
   * @internal
   */
  private _packet = -1

  /**
   * @param packets The array of packets
   * @param file The file to read
   * @param ms Where to start reading (in ms)
   */
  constructor(packets: Array<Packet>, file: Promise<FileHandle>, ms: number) {
    super()

    validation.validatePackets(packets)
    validation.validateFileHandle(file)
    validation.validateMs(ms)
    
    this._packets = packets
    this._file = file
    this._ms = ms
  }

  /**
   * @internal
   */
  async _read(): Promise<void> {
    if (this._file instanceof Promise) this._file = await this._file
    if (this._position < 0) this._setPosition()

    validation.validateFile(this._file)

    const packet = this._packets[this._packet++]

    if (!packet) {
      this.push(null)
      return
    }

    const buffer = Buffer.alloc(packet.size)
    const { bytesRead } = await this._file.read(buffer, 0, packet.size, this._position)

    if (!bytesRead) {
      this.push(null)
      return
    }

    this.packetRead += packet.frames * frameSize
    this._position += packet.size
    
    this.push(buffer)
  }

  /**
   * @internal
   */
  private _setPosition(): void {
    this._position = 0
    this._packet = 0

    if (!this._ms) return

    let ms = 0

    for (let index = 0; index < this._packets.length; ++index) {
      const packet = this._packets[this._packet]
      const packetMs = packet.frames * frameSize

      ms += packetMs
      this.packetRead += packetMs
      this._position += packet.size
      this._packet++

      if (ms >= this._ms) break
    }

    if (ms < this._ms) this._packet = -1
  }
}