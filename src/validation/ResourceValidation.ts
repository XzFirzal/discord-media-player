import type { AudioPlayer } from "../audio/AudioPlayer"
import { PlayerError, ErrorMessages } from "./PlayerError"
import { Readable, Duplex, Transform } from "stream"
import { ResourceOptions } from "../util/Resource"
import { CacheWriter } from "../cache/CacheWriter"
import { Cache } from "../cache/Cache"

function validatePlayerOption(player: AudioPlayer): void {
  if (typeof player !== "object" || player === null) throw new PlayerError(ErrorMessages.Expecting("object", "ResourceOptions.player", player === null ? "null" : typeof player))

  if (!("manager" in player)) throw new PlayerError(ErrorMessages.NotProvided("manager", "ResourceOptions.player"))
  if (!("guildID" in player)) throw new PlayerError(ErrorMessages.NotProvided("guildID", "ResourceOptions.player"))
  
  if (!("status" in player)) throw new PlayerError(ErrorMessages.NotProvided("status", "ResourceOptions.player"))
  else if (typeof player.status !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "ResourceOptions.player.status", typeof player.status))

  if (!("playing" in player)) throw new PlayerError(ErrorMessages.NotProvided("playing", "ResourceOptions.player"))
  else if (typeof player.playing !== "boolean") throw new PlayerError(ErrorMessages.Expecting("boolean", "ResourceOptions.player.playing", typeof player.playing))

  if (!("setManager" in player)) throw new PlayerError(ErrorMessages.NotProvided("setManager", "ResourceOptions.player"))
  else if (typeof player.setManager !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "ResourceOptions.player.setManager", typeof player.setManager))

  if (!("link" in player)) throw new PlayerError(ErrorMessages.NotProvided("link", "ResourceOptions.player"))
  else if (typeof player.link !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "ResourceOptions.player.link", typeof player.link))

  if (!("unlink" in player)) throw new PlayerError(ErrorMessages.NotProvided("unlink", "ResourceOptions.player"))
  else if (typeof player.unlink !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "ResourceOptions.player.unlink", typeof player.unlink))

  if (!("setFilter" in player)) throw new PlayerError(ErrorMessages.NotProvided("setFilter", "ResourceOptions.player"))
  else if (typeof player.setFilter !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "ResourceOptions.player.setFilter", typeof player.setFilter))

  if (!("setVolume" in player)) throw new PlayerError(ErrorMessages.NotProvided("setVolume", "ResourceOptions.player"))
  else if (typeof player.setVolume !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "ResourceOptions.player.setVolume", typeof player.setVolume))

  if (!("stop" in player)) throw new PlayerError(ErrorMessages.NotProvided("stop", "ResourceOptions.player"))
  else if (typeof player.stop !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "ResourceOptions.player.stop", typeof player.stop))

  if (!("loop" in player)) throw new PlayerError(ErrorMessages.NotProvided("loop", "ResourceOptions.player"))
  else if (typeof player.loop !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "ResourceOptions.player.loop", typeof player.loop))

  if (!("pause" in player)) throw new PlayerError(ErrorMessages.NotProvided("pause", "ResourceOptions.player"))
  else if (typeof player.pause !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "ResourceOptions.player.pause", typeof player.pause))

  if (!("filter" in player)) throw new PlayerError(ErrorMessages.NotProvided("filter", "ResourceOptions.player"))
  else if (typeof player.filter !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "ResourceOptions.player.filter", typeof player.filter))

  if (!("seek" in player)) throw new PlayerError(ErrorMessages.NotProvided("seek", "ResourceOptions.player"))
  else if (typeof player.seek !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "ResourceOptions.player.seek", typeof player.seek))

  if (!("play" in player)) throw new PlayerError(ErrorMessages.NotProvided("play", "ResourceOptions.player"))
  else if (typeof player.play !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "ResourceOptions.player.play", typeof player.play))

  if (!("_switchCache" in player)) throw new PlayerError(ErrorMessages.NotProvided("_switchCache", "ResourceOptions.player"))
  else if (typeof player._switchCache !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "ResourceOptions.player._switchCache", typeof player._switchCache))
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

  if (options.cache != undefined) {
    if (typeof options.cache !== "object" || options.cache === null) throw new PlayerError(ErrorMessages.Expecting("object", "ResourceOptions.cache", options.cache === null ? "null" : typeof options.cache))
    else if (!(options.cache instanceof Cache)) throw new PlayerError(ErrorMessages.Expecting("Cache", "ResourceOptions.cache", options.cache))
  }

  if (options.demuxer != undefined) {
    if (typeof options.demuxer !== "object" || options.demuxer === null) throw new PlayerError(ErrorMessages.Expecting("object", "ResourceOptions.demuxer", options.demuxer === null ? "null" : typeof options.demuxer))
    else if (!(options.demuxer instanceof Transform)) throw new PlayerError(ErrorMessages.Expecting("Transform", "ResourceOptions.demuxer", options.demuxer))
  }

  if (options.cacheWriter != undefined) {
    if (typeof options.cacheWriter !== "object" || options.cacheWriter === null) throw new PlayerError(ErrorMessages.Expecting("object", "ResourceOptions.cacheWriter", options.cacheWriter === null ? "null" : typeof options.cacheWriter))
    else if (!(options.cacheWriter instanceof CacheWriter)) throw new PlayerError(ErrorMessages.Expecting("CacheWriter", "ResourceOptions.cacheWriter", options.cacheWriter))
  }
}

export function validatePlayer(player: AudioPlayer): void {
  if (typeof player !== "object" || player === null) throw new PlayerError(ErrorMessages.Expecting("object", "Resource.player", player === null ? "null" : typeof player))

  if (!("manager" in player)) throw new PlayerError(ErrorMessages.NotProvided("manager", "Resource.player"))
  if (!("guildID" in player)) throw new PlayerError(ErrorMessages.NotProvided("guildID", "Resource.player"))

  if (!("status" in player)) throw new PlayerError(ErrorMessages.NotProvided("status", "Resource.player"))
  else if (typeof player.status !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "Resource.player.status", typeof player.status))

  if (!("playing" in player)) throw new PlayerError(ErrorMessages.NotProvided("playing", "Resource.player"))
  else if (typeof player.playing !== "boolean") throw new PlayerError(ErrorMessages.Expecting("boolean", "Resource.player.playing", typeof player.playing))

  if (!("setManager" in player)) throw new PlayerError(ErrorMessages.NotProvided("setManager", "Resource.player"))
  else if (typeof player.setManager !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "Resource.player.setManager", typeof player.setManager))

  if (!("link" in player)) throw new PlayerError(ErrorMessages.NotProvided("link", "Resource.player"))
  else if (typeof player.link !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "Resource.player.link", typeof player.link))

  if (!("unlink" in player)) throw new PlayerError(ErrorMessages.NotProvided("unlink", "Resource.player"))
  else if (typeof player.unlink !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "Resource.player.unlink", typeof player.unlink))

  if (!("setFilter" in player)) throw new PlayerError(ErrorMessages.NotProvided("setFilter", "Resource.player"))
  else if (typeof player.setFilter !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "Resource.player.setFilter", typeof player.setFilter))

  if (!("setVolume" in player)) throw new PlayerError(ErrorMessages.NotProvided("setVolume", "Resource.player"))
  else if (typeof player.setVolume !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "Resource.player.setVolume", typeof player.setVolume))

  if (!("stop" in player)) throw new PlayerError(ErrorMessages.NotProvided("stop", "Resource.player"))
  else if (typeof player.stop !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "Resource.player.stop", typeof player.stop))

  if (!("loop" in player)) throw new PlayerError(ErrorMessages.NotProvided("loop", "Resource.player"))
  else if (typeof player.loop !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "Resource.player.loop", typeof player.loop))

  if (!("pause" in player)) throw new PlayerError(ErrorMessages.NotProvided("pause", "Resource.player"))
  else if (typeof player.pause !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "Resource.player.pause", typeof player.pause))

  if (!("filter" in player)) throw new PlayerError(ErrorMessages.NotProvided("filter", "Resource.player"))
  else if (typeof player.filter !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "Resource.player.filter", typeof player.filter))

  if (!("seek" in player)) throw new PlayerError(ErrorMessages.NotProvided("seek", "Resource.player"))
  else if (typeof player.seek !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "Resource.player.seek", typeof player.seek))

  if (!("play" in player)) throw new PlayerError(ErrorMessages.NotProvided("play", "Resource.player"))
  else if (typeof player.play !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "Resource.player.play", typeof player.play))

  if (!("_switchCache" in player)) throw new PlayerError(ErrorMessages.NotProvided("_switchCache", "Resource.player"))
  else if (typeof player._switchCache !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "Resource.player._switchCache", typeof player._switchCache))
}

export function validatePaused(paused: boolean): void {
  if (typeof paused !== "boolean") throw new PlayerError(ErrorMessages.Expecting("boolean", "Resource.autoPaused", typeof paused))
}