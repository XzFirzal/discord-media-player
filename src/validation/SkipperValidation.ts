import { PlayerError, ErrorMessages } from "./PlayerError"
import { CacheWriter } from "../cache/CacheWriter"

export function validateSeconds(seconds: number): void {
  if (typeof seconds !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "Skipper.seconds", typeof seconds))
  else if (!Number.isInteger(seconds)) throw new PlayerError(ErrorMessages.NotInteger(seconds))
}

export function validateCacheWriter(cacheWriter: CacheWriter): void {
  if (typeof cacheWriter !== "object" || cacheWriter === null) throw new PlayerError(ErrorMessages.Expecting("object", "Skipper.cacheWriter", cacheWriter === null ? "null" : typeof cacheWriter))
  else if (!(cacheWriter instanceof CacheWriter)) throw new PlayerError(ErrorMessages.Expecting("CacheWriter", "Skipper.cacheWriter", cacheWriter))
}