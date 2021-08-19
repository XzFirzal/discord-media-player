import type { TransformCallback } from "stream"
import { Transform } from "stream"

/**
 * The metadata of packets including packet size and packet frames count
 */
export interface Packet {
  size: number
  frames: number
}

/**
 * An instance to mark the packet size and frames in packet
 */
export class PacketReader extends Transform {
  /**
   * @internal
   */
  private readonly _packets: Array<Packet>

  /**
   * @param packets The allocated array of packets
   */
  constructor(packets: Array<Packet>) {
    super()
    this._packets = packets
  }

  /**
   * @internal
   */
  _transform(packet: Buffer, _: BufferEncoding, cb: TransformCallback): void {
    let frameCount = packet.readUInt8() & 3

    if (frameCount === 3) frameCount = packet.readUInt8(1) & 63
    else frameCount = frameCount > 0 ? 2 : 1

    this.push(packet)
    this._packets.push({
      size: packet.length,
      frames: frameCount
    })

    cb()
  }
}