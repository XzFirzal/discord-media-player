import type { Filters } from "../util/Filters"
import type { AudioManager } from "./AudioManager"
import type { VoiceConnection, AudioPlayerStatus } from "@discordjs/voice"

/**
 * The instance to manage and playing audio to discord
 */
export interface AudioPlayer {
  /**
   * The manager of the audio player
   */
  manager: AudioManager
  /**
   * The discord player status
   */
  status: AudioPlayerStatus
  /**
   * The audio player is playing or not
   */
  playing: boolean
  
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
  pause(forcePauseUnpause?: boolean): boolean
  /**
   * Filter the audio
   */
  filter(): void
  /**
   * Seek the audio
   * @param seconds The seconds of where to seek
   */
  seek(seconds: number): Promise<void>
  /**
   * Play an audio
   * @param urlOrLocation The url or location of the audio source
   * @param sourceType The source type to identify the source
   */
  play(urlOrLocation: string, sourceType: number): Promise<void>
  /**
   * Switch to playing cache instead of resource
   * 
   * This method must not be used by user directly,
   * it is used for custom player implementation to work
   * with cache
   */
  _switchCache(): void
}