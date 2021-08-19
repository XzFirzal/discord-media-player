import type { Filters } from "../util/Filters"
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