import type { AudioPlayer } from "../audio/AudioPlayer"
import { PlayerError, ErrorMessages } from "./PlayerError"
import { QueueManager } from "../queue"

// eslint-disable-next-line @typescript-eslint/ban-types
export function validateManager<TM extends object>(manager: QueueManager<TM>): void {
  if (typeof manager !== "object" || manager === null) throw new PlayerError(ErrorMessages.Expecting("object", "QueueHandler.manager", manager === null ? "null" : typeof manager))
  else if (!(manager instanceof QueueManager)) throw new PlayerError(ErrorMessages.Expecting("QueueManager", "QueueHandler.manager", manager))
}

export function validatePlayer(player: AudioPlayer): void {
  if (typeof player !== "object" || player === null) throw new PlayerError(ErrorMessages.Expecting("object", "QueueHandler.player", player === null ? "null" : typeof player))

  if (!("manager" in player)) throw new PlayerError(ErrorMessages.NotProvided("manager", "QueueHandler.player"))
  if (!("guildID" in player)) throw new PlayerError(ErrorMessages.NotProvided("guildID", "QueueHandler.player"))

  if (!("status" in player)) throw new PlayerError(ErrorMessages.NotProvided("status", "QueueHandler.player"))
  else if (typeof player.status !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "QueueHandler.player.status", typeof player.status))

  if (!("playing" in player)) throw new PlayerError(ErrorMessages.NotProvided("playing", "QueueHandler.player"))
  else if (typeof player.playing !== "boolean") throw new PlayerError(ErrorMessages.Expecting("boolean", "QueueHandler.player.playing", typeof player.playing))

  if (!("setManager" in player)) throw new PlayerError(ErrorMessages.NotProvided("setManager", "QueueHandler.player"))
  else if (typeof player.setManager !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "QueueHandler.player.setManager", typeof player.setManager))

  if (!("link" in player)) throw new PlayerError(ErrorMessages.NotProvided("link", "QueueHandler.player"))
  else if (typeof player.link !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "QueueHandler.player.link", typeof player.link))

  if (!("unlink" in player)) throw new PlayerError(ErrorMessages.NotProvided("unlink", "QueueHandler.player"))
  else if (typeof player.unlink !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "QueueHandler.player.unlink", typeof player.unlink))

  if (!("setFilter" in player)) throw new PlayerError(ErrorMessages.NotProvided("setFilter", "QueueHandler.player"))
  else if (typeof player.setFilter !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "QueueHandler.player.setFilter", typeof player.setFilter))

  if (!("setVolume" in player)) throw new PlayerError(ErrorMessages.NotProvided("setVolume", "QueueHandler.player"))
  else if (typeof player.setVolume !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "QueueHandler.player.setVolume", typeof player.setVolume))

  if (!("stop" in player)) throw new PlayerError(ErrorMessages.NotProvided("stop", "QueueHandler.player"))
  else if (typeof player.stop !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "QueueHandler.player.stop", typeof player.stop))

  if (!("loop" in player)) throw new PlayerError(ErrorMessages.NotProvided("loop", "QueueHandler.player"))
  else if (typeof player.loop !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "QueueHandler.player.loop", typeof player.loop))

  if (!("pause" in player)) throw new PlayerError(ErrorMessages.NotProvided("pause", "QueueHandler.player"))
  else if (typeof player.pause !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "QueueHandler.player.pause", typeof player.pause))

  if (!("filter" in player)) throw new PlayerError(ErrorMessages.NotProvided("filter", "QueueHandler.player"))
  else if (typeof player.filter !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "QueueHandler.player.filter", typeof player.filter))

  if (!("seek" in player)) throw new PlayerError(ErrorMessages.NotProvided("seek", "QueueHandler.player"))
  else if (typeof player.seek !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "QueueHandler.player.seek", typeof player.seek))

  if (!("play" in player)) throw new PlayerError(ErrorMessages.NotProvided("play", "QueueHandler.player"))
  else if (typeof player.play !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "QueueHandler.player.play", typeof player.play))

  if (!("_switchCache" in player)) throw new PlayerError(ErrorMessages.NotProvided("_switchCache", "QueueHandler.player"))
  else if (typeof player._switchCache !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "QueueHandler.player._switchCache", typeof player._switchCache))
}