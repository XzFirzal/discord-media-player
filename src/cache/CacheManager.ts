import type { Cache } from "./Cache"

export interface CacheManager {
  /**
   * The base directory of the caches
   */
  path: string

  /**
   * Audio cache from youtube source
   */
  readonly youtube: Cache
  /**
   * Audio cache from soundcloud source
   */
  readonly soundcloud: Cache
  /**
   * Audio cache from local source
   */
  readonly local: Cache

  /**
   * Set the base directory of the caches
   * @param path The base directory
   */
  setPath(path: string): void
}