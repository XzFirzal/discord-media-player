import type { CacheManager } from "./CacheManager"
import { Cache } from "./Cache"

/**
 * The default implementation of {@link CacheManager | CacheManager}
 */
export class CacheManagerImpl implements CacheManager {
  /**
   * @internal
   */
  public path: string

  /**
   * @internal
   */
  public readonly youtube = new Cache("youtube")
  /**
   * @internal
   */
  public readonly soundcloud = new Cache("soundcloud")
  /**
   * @internal
   */
  public readonly local = new Cache("local")

  /**
   * @internal
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {}

  /**
   * @internal
   */
  setPath(path: string): void {
    this.path = path

    this.youtube.setPath(path)
    this.soundcloud.setPath(path)
    this.local.setPath(path)
  }
}