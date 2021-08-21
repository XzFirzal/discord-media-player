import type { AudioPlayer } from "../audio/AudioPlayer"
import { validatePlayer as playerValidate } from "./PlayerValidation"
import { PlayerError, ErrorMessages } from "./PlayerError"
import { Readable, Duplex, Transform } from "stream"
import { ResourceOptions } from "../util/Resource"
import { CacheWriter } from "../cache/CacheWriter"
import { Cache } from "../cache/Cache"

function validatePlayerOption(player: AudioPlayer): void {
  playerValidate(player, "ResourceOptions.player")
}

export function validateOptions(options: ResourceOptions): void {
  if (typeof options !== "object" || options === null) throw new PlayerError(ErrorMessages.Expecting("object", "ResourceOptions", options === null ? "null" : typeof options))

  if (!("player" in options)) throw new PlayerError(ErrorMessages.NotProvided("player", "ResourceOptions"))
  else validatePlayerOption(options.player)

  if (!("identifier" in options)) throw new PlayerError(ErrorMessages.NotProvided("identifier", "ResourceOptions"))
  else if (typeof options.identifier !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "ResourceOptions.identifier", typeof options.identifier))

  if (!("decoder" in options)) throw new PlayerError(ErrorMessages.NotProvided("decoder", "ResourceOptions"))
  else if (typeof options.decoder !== "object" || options.decoder === null) throw new PlayerError(ErrorMessages.Expecting("object", "ResourceOptions.decoder", options.decoder === null ? "null" : typeof options.decoder))
  else if (!(options.decoder instanceof Transform || options.decoder instanceof Duplex)) throw new PlayerError(ErrorMessages.Expecting(["Duplex", "Transform"], "ResourceOptions.decoder", options.decoder))

  if (!("source" in options)) throw new PlayerError(ErrorMessages.NotProvided("source", "ResourceOptions"))
  else if (typeof options.source !== "object" || options.source === null) throw new PlayerError(ErrorMessages.Expecting("object", "ResourceOptions.source", options.source === null ? "null" : typeof options.source))
  else if (!(options.source instanceof Readable)) throw new PlayerError(ErrorMessages.Expecting("Readable", "ResourceOptions.source", options.source))

  if (!("cacheWriter" in options)) throw new PlayerError(ErrorMessages.NotProvided("cacheWriter", "ResourceOptions"))
  else if (typeof options.cacheWriter !== "object" || options.cacheWriter === null) throw new PlayerError(ErrorMessages.Expecting("object", "ResourceOptions.cacheWriter", options.cacheWriter === null ? "null" : typeof options.cacheWriter))
  else if (!(options.cacheWriter instanceof CacheWriter)) throw new PlayerError(ErrorMessages.Expecting("CacheWriter", "ResourceOptions.cacheWriter", options.cacheWriter))
  
  if (options.cache != undefined) {
    if (typeof options.cache !== "object" || options.cache === null) throw new PlayerError(ErrorMessages.Expecting("object", "ResourceOptions.cache", options.cache === null ? "null" : typeof options.cache))
    else if (!(options.cache instanceof Cache)) throw new PlayerError(ErrorMessages.Expecting("Cache", "ResourceOptions.cache", options.cache))
  }

  if (options.demuxer != undefined) {
    if (typeof options.demuxer !== "object" || options.demuxer === null) throw new PlayerError(ErrorMessages.Expecting("object", "ResourceOptions.demuxer", options.demuxer === null ? "null" : typeof options.demuxer))
    else if (!(options.demuxer instanceof Transform)) throw new PlayerError(ErrorMessages.Expecting("Transform", "ResourceOptions.demuxer", options.demuxer))
  }

  if ("isLive" in options && typeof options.isLive !== "boolean") throw new PlayerError(ErrorMessages.Expecting("boolean", "ResourceOptions.isLive", typeof options.isLive))
}

export function validatePlayer(player: AudioPlayer): void {
  playerValidate(player, "Resource.player")
}

export function validatePaused(paused: boolean): void {
  if (typeof paused !== "boolean") throw new PlayerError(ErrorMessages.Expecting("boolean", "Resource.autoPaused", typeof paused))
}