import type { AudioPlayer } from "../audio/AudioPlayer"
import type { CacheManager } from "../cache/CacheManager"
import type { AudioManagerOptions } from "../audio/AudioManager"
import { validatePlayer as playerValidate } from "./PlayerValidation"
import { PlayerError, ErrorMessages } from "./PlayerError"
import { VoiceConnection } from "@discordjs/voice"
import { Cache } from "../cache/Cache"
import SCDL from "soundcloud-downloader"

function validateCacheManager(cacheManager: CacheManager): void {
  if (typeof cacheManager !== "object" || cacheManager === null) throw new PlayerError(ErrorMessages.Expecting("object", "AudioManagerOptions.cache", cacheManager === null ? "null" : typeof cacheManager))

  if (!("youtube" in cacheManager)) throw new PlayerError(ErrorMessages.NotProvided("youtube", "AudioManagerOptions.cache"))
  else if (!(cacheManager.youtube instanceof Cache)) throw new PlayerError(ErrorMessages.Expecting("Cache", "AudioManagerOptions.cache.youtube", cacheManager.youtube))

  if (!("soundcloud" in cacheManager)) throw new PlayerError(ErrorMessages.NotProvided("soundcloud", "AudioManagerOptions.cache"))
  else if (!(cacheManager.soundcloud instanceof Cache)) throw new PlayerError(ErrorMessages.Expecting("Cache", "AudioManagerOptions.cache.soundcloud", cacheManager.soundcloud))

  if (!("local" in cacheManager)) throw new PlayerError(ErrorMessages.NotProvided("local", "AudioManagerOptions.cache"))
  else if (!(cacheManager.local instanceof Cache)) throw new PlayerError(ErrorMessages.Expecting("Cache", "AudioManagerOptions.cache.local", cacheManager.local))

  if (typeof cacheManager.setPath !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "AudioManagerOptions.cache.setPath", typeof cacheManager.setPath))
  if (typeof cacheManager.setTimeout !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "AudioManagerOptions.cache.setTimeout", typeof cacheManager.setTimeout))
}

/**
 * Validate the audio manager options
 * @param options The audio manager options
 */
export function validateOptions(options: AudioManagerOptions): void {
  if (typeof options !== "object" || options === null) throw new PlayerError(ErrorMessages.Expecting("object", "AudioManagerOptions", options === null ? "null" : typeof options))

  if ("cache" in options) {
    validateCacheManager(options.cache)

    if ("cacheDir" in options && typeof options.cacheDir !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "AudioManagerOptions.cacheDir", typeof options.cacheDir))
    if ("cacheTimeout" in options && typeof options.cacheTimeout !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "AudioManagerOptions.cacheTimeout", typeof options.cacheTimeout))
  }

  if ("soundcloudClient" in options) {
    if (typeof options.soundcloudClient !== "object" || options.soundcloudClient === null) throw new PlayerError(ErrorMessages.Expecting("object", "AudioManagerOptions.soundcloudClient", options.soundcloudClient === null ? "null" : typeof options.soundcloudClient))
    if (!(options.soundcloudClient instanceof SCDL.constructor)) throw new PlayerError(ErrorMessages.Expecting("SCDL", "AudioManagerOptions.soundcloudClient", options.soundcloudClient))
  }

  if ("createAudioPlayer" in options && typeof options.createAudioPlayer !== "function") throw new PlayerError(ErrorMessages.Expecting("function", "AudioManagerOptions.createAudioPlayer", typeof options.createAudioPlayer))
}

/**
 * Validate the voice connection
 * @param connection The voice connection
 */
export function validateConnection(connection: VoiceConnection): void {
  if (typeof connection !== "object" || connection === null) throw new PlayerError(ErrorMessages.Expecting("object", "AudioManager.connection", connection === null ? "null" : typeof connection))
  if (!(connection instanceof VoiceConnection)) throw new PlayerError(ErrorMessages.Expecting("VoiceConnection", "AudioManager.connection", connection))
}

/**
 * Validate the audio player
 * @param player The audio player
 */
export function validatePlayer(player: AudioPlayer): void {
  playerValidate(player, "AudioManager.createAudioPlayer()")
}