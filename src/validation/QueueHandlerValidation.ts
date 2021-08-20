import type { AudioPlayer } from "../audio/AudioPlayer"
import { validatePlayer as playerValidate } from "./PlayerValidation"
import { PlayerError, ErrorMessages } from "./PlayerError"
import { QueueManager } from "../queue"

// eslint-disable-next-line @typescript-eslint/ban-types
export function validateManager<TM extends object>(manager: QueueManager<TM>): void {
  if (typeof manager !== "object" || manager === null) throw new PlayerError(ErrorMessages.Expecting("object", "QueueHandler.manager", manager === null ? "null" : typeof manager))
  else if (!(manager instanceof QueueManager)) throw new PlayerError(ErrorMessages.Expecting("QueueManager", "QueueHandler.manager", manager))
}

export function validatePlayer(player: AudioPlayer): void {
  playerValidate(player, "QueueHandler.player")
}