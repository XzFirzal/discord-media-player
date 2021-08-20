import type { CacheOptions } from "../cache/Cache"
import { PlayerError, ErrorMessages } from "./PlayerError"
import { Resource } from "../util/Resource"
import { opus } from "prism-media"

/**
 * Validate the cache directory
 * @param dir The cache directory
 */
export function validateDir(dir: string): void {
  if (typeof dir !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "Cache.dir", typeof dir))
}

/**
 * Validate the cache options
 * @param options The cache options
 */
export function validateOptions(options: CacheOptions): void {
  if (typeof options !== "object" || options === null) throw new PlayerError(ErrorMessages.Expecting("object", "CacheOptions", options === null ? "null" : typeof options))
  if (!("path" in options) && !("timeout" in options)) throw new PlayerError(ErrorMessages.AtleastHave("CacheOptions", ["path", "timeout"]))

  if ("path" in options) if (typeof options.path !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "CacheOptions.path", typeof options.path))
  if ("timeout" in options) {
    if (typeof options.timeout !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "CacheOptions.timeout", typeof options.timeout))
    else if (!Number.isInteger(options.timeout)) throw new PlayerError(ErrorMessages.NotInteger(options.timeout))
  }
}

/**
 * Validate the cache identifier
 * @param identifier The cache identifier
 */
export function validateIdentifier(identifier: string): void {
  if (typeof identifier !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "Cache.identifier", typeof identifier))
}

/**
 * Validate the cache resource
 * @param resource The cache resource
 */
export function validateResource(resource: Resource): void {
  if (typeof resource !== "object" || resource === null) throw new PlayerError(ErrorMessages.Expecting("object", "Cache.resource", resource === null ? "null" : typeof resource))
  else if (!(resource instanceof Resource)) throw new PlayerError(ErrorMessages.Expecting("Resource", "Cache.resource", resource))
}

/**
 * Validate the seconds
 * @param seconds Where to start the audio (in seconds)
 */
export function validateSeconds(seconds: number): void {
  if (typeof seconds !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "Cache.seconds", typeof seconds))
}

export function validateDecoder(decoder: opus.Decoder): void {
  if (typeof decoder !== "object" || decoder === null) throw new PlayerError(ErrorMessages.Expecting("object", "Cache.getReader.decoder", decoder === null ? "null" : typeof decoder))
  else if (!(decoder instanceof opus.Decoder)) throw new PlayerError(ErrorMessages.Expecting("OpusDecoder", "Cache.getReader.decoder", decoder))
}