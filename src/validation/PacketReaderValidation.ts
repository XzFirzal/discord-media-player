import type { Packet } from "../cache/PacketReader"
import { PlayerError, ErrorMessages } from "./PlayerError"

export function validatePackets(packets: Array<Packet>): void {
  if (typeof packets !== "object" || packets === null) throw new PlayerError(ErrorMessages.Expecting("object", "PacketReader.packets", packets === null ? "null" : typeof packets))
  else if (!Array.isArray(packets)) throw new PlayerError(ErrorMessages.Expecting("Array", "PacketReader.packets", packets))
}