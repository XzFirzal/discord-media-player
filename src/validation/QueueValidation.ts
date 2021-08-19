import { PlayerError, ErrorMessages } from "./PlayerError"
import { Track } from "../queue"

// eslint-disable-next-line @typescript-eslint/ban-types
export function validateTrack<TM extends object>(track: Track<TM>): void {
  if (typeof track !== "object" || track === null) throw new PlayerError(ErrorMessages.Expecting("object", "Queue.add.track", track === null ? "null" : typeof track))
  else if (!(track instanceof Track)) throw new PlayerError(ErrorMessages.Expecting("Track", "Queue.add.track", track))
}

export function validateRemove(what: string, value: number): void {
  if (typeof value !== "number") throw new PlayerError(ErrorMessages.Expecting("number", `Queue.remove.${what}`, typeof value))
  else if (!Number.isInteger(value)) throw new PlayerError(ErrorMessages.NotInteger(value))
}