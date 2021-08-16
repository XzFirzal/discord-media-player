import type { CacheManager } from "./CacheManager"
import { CacheManagerValidation as validation } from "../validation"
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
  public timeout: number

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
  setTimeout(timeout: number): void {
    validation.validateTimeout(timeout)
    this.timeout = timeout

    this.youtube.setOptions({ timeout })
    this.soundcloud.setOptions({ timeout })
    this.local.setOptions({ timeout })
  }

  /**
   * @internal
   */
  setPath(path: string): void {
    validation.validatePath(path)
    this.path = path

    this.youtube.setOptions({ path })
    this.soundcloud.setOptions({ path })
    this.local.setOptions({ path })
  }
}