import type { Filters } from "../util/Filters"
import type { AudioManager } from "./AudioManager"
import type { SourceType } from "../util/SourceType"
import type { VoiceConnection } from "@discordjs/voice"

/**
 * The instance to manage and playing audio to discord
 */
export interface AudioPlayer {
  /**
   * The manager of the audio player
   */
  manager: AudioManager
  
  /**
   * Set the manager of the audio player
   * @param manager The audio manager
   */
  setManager(manager: AudioManager): void
  /**
   * Link the voice connection to the audio player
   * @param connection The voice connection
   */
  link(connection: VoiceConnection): void
  /**
   * Unlink the audio player from the previous voice connection
   */
  unlink(): void
  /**
   * Set filters into the audio player
   * @param filter The filters
   */
  setFilter(filter?: Filters): void
  /**
   * Set volume of the audio
   * @param volume The volume
   */
  setVolume(volume: number): void
  /**
   * Stop the audio
   */
  stop(): boolean
  /**
   * Loop the audio
   */
  loop(): boolean
  /**
   * Pause the audio
   */
  pause(): boolean
  /**
   * Filter the audio
   */
  filter(): void
  /**
   * Seek the audio
   * @param seconds The seconds of where to seek
   */
  seek(seconds?: number): Promise<void>
  /**
   * Play an audio
   * @param urlOrLocation The url or location of the audio source
   * @param sourceType The source type to identify the source
   */
  play(urlOrLocation: string, sourceType: SourceType): Promise<void>
}