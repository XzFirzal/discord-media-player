import type { Packet } from "../cache/PacketReader"

import { PlayerError, ErrorMessages } from "./PlayerError"
import { FileHandle } from "fs/promises"

export function validatePackets(packets: Array<Packet>): void {
  if (typeof packets !== "object" || packets === null) throw new PlayerError(ErrorMessages.Expecting("object", "CacheReader.packets", packets === null ? "null" : typeof packets))
  else if (!Array.isArray(packets)) throw new PlayerError(ErrorMessages.Expecting("Array", "CacheReader.packets", packets))
}

export function validateFileHandle(fileHandle: Promise<FileHandle>): void {
  if (typeof fileHandle !== "object" || fileHandle === null) throw new PlayerError(ErrorMessages.Expecting("object", "CacheReader.file", fileHandle === null ? "null" : typeof fileHandle))
  else if (!(fileHandle instanceof Promise)) throw new PlayerError(ErrorMessages.Expecting("Promise<FileHandle>", "CacheReader.file", fileHandle))
}

export function validateMs(ms: number): void {
  if (typeof ms !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "CacheReader.ms", typeof ms))
  else if (!Number.isInteger(ms)) throw new PlayerError(ErrorMessages.NotInteger(ms))
}

export function validateFile(file: FileHandle): void {
  if (typeof file !== "object" || file === null) throw new PlayerError(ErrorMessages.Expecting("object", "CacheReader.file", file === null ? "null" : typeof file))
  else if (!("read" in file)) throw new PlayerError(ErrorMessages.NotProvided("read", "CacheReader.file"))
  else if (typeof file.read !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "CacheReader.file.read", typeof file.read))
}