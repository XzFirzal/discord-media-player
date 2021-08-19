import type { AudioManager } from "../audio/AudioManager"
import type { youtubeSearchOptions, soundcloudSearchOptions } from "../queue"

import { PlayerError, ErrorMessages } from "./PlayerError"
import { VoiceConnection } from "@discordjs/voice"

export function validateAudioManager(audioManager: AudioManager): void {
  if (typeof audioManager !== "object" || audioManager === null) throw new PlayerError(ErrorMessages.Expecting("object", "QueueManager.audioManager", audioManager === null ? "null" : typeof audioManager))
}

export function validateConnection(connection: VoiceConnection): void {
  if (typeof connection !== "object" || connection === null) throw new PlayerError(ErrorMessages.Expecting("object", "QueueManager.connection", connection === null ? "null" : typeof connection))
  else if (!(connection instanceof VoiceConnection)) throw new PlayerError(ErrorMessages.Expecting("VoiceConnection", "QueueManager.connection", connection))
}

export function validateYoutubeSearchOptions(options: youtubeSearchOptions): void {
  if (typeof options !== "object" || options === null) throw new PlayerError(ErrorMessages.Expecting("object", "YoutubeSearchOptions", options === null ? "null" : typeof options))

  if (!("query" in options)) throw new PlayerError(ErrorMessages.NotProvided("query", "YoutubeSearchOptions"))
  else if (typeof options.query !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "YoutubeSearchOptions.query", typeof options.query))

  if ("searchLimit" in options && typeof options.searchLimit !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "YoutubeSearchOptions.searchLimit", typeof options.searchLimit))
  if ("playlistLimit" in options && typeof options.playlistLimit !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "YoutubeSearchOptions.playlistLimit", typeof options.playlistLimit))
}

export function validateSoundcloudSearchOptions(options: soundcloudSearchOptions): void {
  if (typeof options !== "object" || options === null) throw new PlayerError(ErrorMessages.Expecting("object", "SoundcloudSearchOptions", options === null ? "null" : typeof options))

  if (!("query" in options)) throw new PlayerError(ErrorMessages.NotProvided("query", "SoundcloudSearchOptions"))
  else if (typeof options.query !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "SoundcloudSearchOptions.query", typeof options.query))

  if ("searchLimit" in options && typeof options.searchLimit !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "SoundcloudSearchOptions.searchLimit", typeof options.searchLimit))
  if ("searchOffset" in options && typeof options.searchOffset !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "SoundcloudSearchOptions.searchOffset", typeof options.searchOffset))
  if ("setLimit" in options && typeof options.setLimit !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "SoundcloudSearchOptions.setLimit", typeof options.setLimit))
}