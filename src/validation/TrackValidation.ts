import type { TrackResolvable } from "../queue"
import { PlayerError, ErrorMessages } from "./PlayerError"

// eslint-disable-next-line @typescript-eslint/ban-types
export function validateTrack<TM extends object>(track: TrackResolvable<TM>): void {
  if (typeof track !== "object" || track === null) throw new PlayerError(ErrorMessages.Expecting("object", "Track", track === null ? "null" : typeof track))

  if (!("sourceType" in track)) throw new PlayerError(ErrorMessages.NotProvided("sourceType", "Track"))
  else if (typeof track.sourceType !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "Track.sourceType", typeof track.sourceType))

  if (!("urlOrLocation" in track)) throw new PlayerError(ErrorMessages.NotProvided("urlOrLocation", "Track"))
  else if (typeof track.urlOrLocation !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "Track.urlOrLocation", typeof track.urlOrLocation))

  if ("metadata" in track && (typeof track.metadata !== "object" || track.metadata === null)) throw new PlayerError(ErrorMessages.Expecting("object", "Track.metadata", track.metadata === null ? "null" : typeof track.metadata))
}

export function validateNumber(where: string, value: number): void {
  if (typeof value !== "number") throw new PlayerError(ErrorMessages.Expecting("number", `Track.${where}`, typeof value))
  else if (!Number.isInteger(value)) throw new PlayerError(ErrorMessages.NotInteger(value))
}