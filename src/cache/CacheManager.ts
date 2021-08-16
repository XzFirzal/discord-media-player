import type { Cache } from "./Cache"

export interface CacheManager {
  /**
   * The base directory of the caches
   */
  path: string
  /**
   * The timeout for deleting cache after inactivity
   */
  timeout: number

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
   * Set the cache deletion timeout of the caches
   * @param timeout The cache timeout
   */
  setTimeout(timeout: number): void
  /**
   * Set the base directory of the caches
   * @param path The base directory
   */
  setPath(path: string): void
}