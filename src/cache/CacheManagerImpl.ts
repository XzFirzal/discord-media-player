import type { CacheManager } from "./CacheManager"
import { CacheManagerValidation as validation } from "../validation"
import { fork } from "child_process"
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
  public readonly deleter = fork(require.resolve("./CacheDeleter"), { detached: true })

  /**
   * @internal
   */
  constructor() {
    this.deleter.unref()
  }

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

    this.deleter.send([0, path])
  }

  /**
   * @internal
   */
  async delete(): Promise<void> {
    if (!this.path) return

    this.deleter.send([1])

    await new Promise((res) => this.deleter.once("exit", res))
  }
}