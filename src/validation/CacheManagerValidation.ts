import { PlayerError, ErrorMessages } from "./PlayerError"

export function validatePath(path: string): void {
  if (typeof path !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "CacheManager.path", typeof path))
}

export function validateTimeout(timeout: number): void {
  if (typeof timeout !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "CacheManager.timeout", typeof timeout))
  else if (!Number.isInteger(timeout)) throw new PlayerError(ErrorMessages.NotInteger(timeout))
}