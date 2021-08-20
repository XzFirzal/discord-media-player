import type { Filters } from "../util/Filters"
import type { AudioPlayer } from "../audio/AudioPlayer"
import { PlayerError, ErrorMessages } from "./PlayerError"
import { AudioManager } from "../audio/AudioManager"
import { VoiceConnection} from "@discordjs/voice"

const filters = {
  acompressor: 0,
  aconstrast: 0,
  acrossfade: 0,
  acrossover: 0,
  acrusher: 0,
  adeclick: 0,
  adeclip: 0,
  adelay: 0,
  adenorm: 0,
  aecho: 0,
  aemphasis: 0,
  aexciter: 0,
  afade: 0,
  afftdn: 0,
  afftfilt: 0,
  afir: 0,
  afreqshift: 0,
  agate: 0,
  aiir: 0,
  allpass: 0,
  anequalizer: 0,
  anlmdn: 0,
  apad: 0,
  aphaser: 0,
  aphaseshift: 0,
  apulsator: 0,
  aresample: 0,
  arnndn: 0,
  asetnsamples: 0,
  asetrate: 0,
  asoftclip: 0,
  asubbost: 0,
  asubcut: 0,
  asupercut: 0,
  asuperpass: 0,
  asuperstop: 0,
  atempo: 0,
  bandpass: 0,
  bandreject: 0,
  bass: 0,
  biquad: 0,
  chorus: 0,
  compand: 0,
  compensationdelay: 0,
  crossfeed: 0,
  crystalizer: 0,
  dcshift: 0,
  deesser: 0,
  dynaudnorm: 0,
  earwax: 0,
  equalizer: 0,
  extrastereo: 0,
  firequalizer: 0,
  flanger: 0,
  haas: 0,
  headphone: 0,
  highpass: 0,
  highshelf: 0,
  loudnorm: 0,
  lowpass: 0,
  lowshelf: 0,
  mcompand: 0,
  silenceremove: 0,
  speechnorm: 0,
  stereowiden: 0,
  superequalizer: 0,
  surround: 0,
  treble: 0,
  vibrato: 0
}

/**
 * Validate the audio manager
 * @param manager The audio manager
 */
export function validateManager(manager: AudioManager): void {
  if (typeof manager !== "object" || manager === null) throw new PlayerError(ErrorMessages.Expecting("object", "AudioPlayer.manager", manager === null ? "null" : typeof manager))
  if (!(manager instanceof AudioManager)) throw new PlayerError(ErrorMessages.Expecting("AudioManager", "AudioPlayer.manager", manager))
}

/**
 * Validate the voice connection
 * @param connection The voice connection
 */
export function validateConnection(connection: VoiceConnection): void {
  if (typeof connection !== "object" || connection === null) throw new PlayerError(ErrorMessages.Expecting("object", "AudioPlayer.connection", connection === null ? "null" : typeof connection))
  if (!(connection instanceof VoiceConnection)) throw new PlayerError(ErrorMessages.Expecting("VoiceConnection", "AudioPlayer.connection", connection))
}

/**
 * Validate the audio filters
 * @param filter The audio filters
 */
export function validateFilters(filter?: Filters): void {
  if (filter == null) return
  if (typeof filter !== "object") throw new PlayerError(ErrorMessages.Expecting("object", "AudioPlayer.filter", typeof filter))

  const filterKeys = Object.keys(filter)

  for (const key of filterKeys) {
    if (!(key in filters)) throw new PlayerError(ErrorMessages.NotProvided(key, "AudioPlayer.filter"))
    if (typeof filter[key] !== "string") throw new PlayerError(ErrorMessages.Expecting("string", `AudioPlayer.filter[${key}]`, typeof filter[key]))
  }
}

/**
 * Validate the volume
 * @param volume The volume
 */
export function validateVolume(volume: number): void {
  if (typeof volume !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "AudioPlayer.volume", typeof volume))
}

/**
 * Validate the seconds
 * @param seconds The seconds
 */
export function validateSeconds(seconds: number): void {
  if (typeof seconds !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "AudioPlayer.seconds", typeof seconds))
  if (!Number.isInteger(seconds)) throw new PlayerError(ErrorMessages.NotInteger(seconds))
}

/**
 * Validate the url or location
 * @param urlOrLocation The url or location
 */
export function validateUrlOrLocation(urlOrLocation: string): void {
  if (typeof urlOrLocation !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "AudioPlayer.urlOrLocation", typeof urlOrLocation))
}

/**
 * Validate the source type
 * @param sourceType The source type
 */
export function validateSourceType(sourceType: number): void {
  if (typeof sourceType !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "AudioPlayer.sourceType", typeof sourceType))
  if (!Number.isInteger(sourceType)) throw new PlayerError(ErrorMessages.NotInteger(sourceType))
}

export function validatePlayer(player: AudioPlayer, where: string): void {
  if (typeof player !== "object" || player === null) throw new PlayerError(ErrorMessages.Expecting("object", where, player === null ? "null" : typeof player))

  if (!("manager" in player)) throw new PlayerError(ErrorMessages.NotProvided("manager", where))
  if (!("guildID" in player)) throw new PlayerError(ErrorMessages.NotProvided("guildID", where))

  if (!("status" in player)) throw new PlayerError(ErrorMessages.NotProvided("status", where))
  else if (typeof player.status !== "string") throw new PlayerError(ErrorMessages.Expecting("string", `${where}.status`, typeof player.status))

  if (!("playing" in player)) throw new PlayerError(ErrorMessages.NotProvided("playing", where))
  else if (typeof player.playing !== "boolean") throw new PlayerError(ErrorMessages.Expecting("boolean", `${where}.playing`, typeof player.playing))

  if (!("playbackDuration" in player)) throw new PlayerError(ErrorMessages.NotProvided("playbackDuration", where))
  else if (typeof player.playbackDuration !== "number") throw new PlayerError(ErrorMessages.Expecting("number", `${where}.playbackDuration`, typeof player.playbackDuration))

  if (!("setManager" in player)) throw new PlayerError(ErrorMessages.NotProvided("setManager", where))
  else if (typeof player.setManager !== "function") throw new PlayerError(ErrorMessages.Expecting("function", `${where}.setManager`, typeof player.setManager))

  if (!("link" in player)) throw new PlayerError(ErrorMessages.NotProvided("link", where))
  else if (typeof player.link !== "function") throw new PlayerError(ErrorMessages.Expecting("function", `${where}.link`, typeof player.link))

  if (!("unlink" in player)) throw new PlayerError(ErrorMessages.NotProvided("unlink", where))
  else if (typeof player.unlink !== "function") throw new PlayerError(ErrorMessages.Expecting("function", `${where}.unlink`, typeof player.unlink))

  if (!("setFilter" in player)) throw new PlayerError(ErrorMessages.NotProvided("setFilter", where))
  else if (typeof player.setFilter !== "function") throw new PlayerError(ErrorMessages.Expecting("function", `${where}.setFilter`, typeof player.setFilter))

  if (!("setVolume" in player)) throw new PlayerError(ErrorMessages.NotProvided("setVolume", where))
  else if (typeof player.setVolume !== "function") throw new PlayerError(ErrorMessages.Expecting("function", `${where}.setVolume`, typeof player.setVolume))

  if (!("stop" in player)) throw new PlayerError(ErrorMessages.NotProvided("stop", where))
  else if (typeof player.stop !== "function") throw new PlayerError(ErrorMessages.Expecting("function", `${where}.stop`, typeof player.stop))

  if (!("loop" in player)) throw new PlayerError(ErrorMessages.NotProvided("loop", where))
  else if (typeof player.loop !== "function") throw new PlayerError(ErrorMessages.Expecting("function", `${where}.loop`, typeof player.loop))

  if (!("pause" in player)) throw new PlayerError(ErrorMessages.NotProvided("pause", where))
  else if (typeof player.pause !== "function") throw new PlayerError(ErrorMessages.Expecting("function", `${where}.pause`, typeof player.pause))

  if (!("filter" in player)) throw new PlayerError(ErrorMessages.NotProvided("filter", where))
  else if (typeof player.filter !== "function") throw new PlayerError(ErrorMessages.Expecting("function", `${where}.filter`, typeof player.filter))

  if (!("seek" in player)) throw new PlayerError(ErrorMessages.NotProvided("seek", where))
  else if (typeof player.seek !== "function") throw new PlayerError(ErrorMessages.Expecting("function", `${where}.seek`, typeof player.seek))

  if (!("play" in player)) throw new PlayerError(ErrorMessages.NotProvided("play", where))
  else if (typeof player.play !== "function") throw new PlayerError(ErrorMessages.Expecting("function", `${where}.play`, typeof player.play))

  if (!("_switchCache" in player)) throw new PlayerError(ErrorMessages.NotProvided("_switchCache", where))
  else if (typeof player._switchCache !== "function") throw new PlayerError(ErrorMessages.Expecting("function", `${where}._switchCache`, typeof player._switchCache))
}