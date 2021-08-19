/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Validate the error of PlayerError
 * @param error The error
 */
export function validateError(error: ErrorType): void {
  if (!("message" in error)) throw new PlayerError(ErrorMessages.NotProvided("message", "PlayerError.error"))
  else if (typeof error.message !== "string") throw new PlayerError(ErrorMessages.Expecting("string", "PlayerError.error.message", typeof error.message))

  if (!("code" in error)) throw new PlayerError(ErrorMessages.NotProvided("code", "PlayerError.error"))
  else if (typeof error.code !== "number") throw new PlayerError(ErrorMessages.Expecting("number", "PlayerError.error.code", typeof error.code))
}

/**
 * THe error interface of PlayerError
 */
export interface ErrorType {
  /**
   * The message of the error
   */
  message: string
  /**
   * Error code of the error
   * 
   * 0-99 For built-in player error
   * 
   * 100-??? for custom player error
   */
  code: number
}

/**
 * Available built-in error messages for PlayerError
 */
export namespace ErrorMessages {
  /**
   * Error when value is different than expected
   * @param expecting THe expected value
   * @param where Where does the error take place
   * @param got The actual value
   * @returns The error
   */
  export function Expecting(expecting: string | string[], where: string, got: unknown): ErrorType {
    return {
      message: `Expecting ${
        Array.isArray(expecting) ? expecting.map((expect) => `'${expect}'`).join(" or ") : `'${expecting}'`
      } in '${where}', but got ${
        typeof got === "string"
          ? `'${got}'`
          : typeof got === "number"
          ? got
          : got?.constructor?.name || typeof got
      } instead`,
      code: 0
    }
  }

  /**
   * Error when key is not exist in an object
   * @param what The key that expected to exist in the object
   * @param where Where does the error take place
   * @returns The error
   */
  export function NotProvided(what: string, where: string): ErrorType {
    return {
      message: `'${what}' is not provided in '${where}'`,
      code: 1
    }
  }

  /**
   * Error when value is a number but not an integer
   * @param what The value that supposed to be integer
   * @returns The error
   */
  export function NotInteger(what: number): ErrorType {
    return {
      message: `'${what}' is not an integer`,
      code: 2
    }
  }

  /**
   * Error when value doesn't have any of the thing
   * @param what The value that must have the thing
   * @param things Some thing that must be on the value atleast one of it
   * @returns The error
   */
  export function AtleastHave(what: string, things: string[]): ErrorType {
    return {
      message: `'${what}' must atleast have ${things.map((thing) => `'${thing}'`).join(" or ")}`,
      code: 3
    }
  }

  /**
   * Error when value is not a valid source type
   * @param sourceType The source type
   * @returns The error
   */
  export function NotValidSourceType(sourceType: number): ErrorType {
    return {
      message: `'${sourceType}' is not a valid source type`,
      code: 10
    }
  }

  /**
   * Error when player is already linked
   */
  export const PlayerAlreadyLinked: ErrorType = {
    message: "Player is already linked",
    code: 20
  }

  /**
   * Error when player is not linked
   */
  export const PlayerNotLinked: ErrorType = {
    message: "Player is not linked yet",
    code: 21
  }

  /**
   * Error when player is already playing
   */
  export const PlayerAlreadyPlaying: ErrorType = {
    message: "Player is already playing",
    code: 22
  }

  /**
   * Error when player is not playing
   */
  export const PlayerNotPlaying: ErrorType = {
    message: "Player is not playing yet",
    code: 23
  }

  /**
   * Error when cache with the provided identifier already exist
   * @param identifier The cache identifier
   * @returns The error
   */
  export function CacheAlreadyExist(identifier: string): ErrorType {
    return {
      message: `Cache with identifier '${identifier}' already exist`,
      code: 30
    }
  }

  /**
   * Error when cache with the provided identifier doesn't exist
   * @param identifier The cache identifier
   * @returns The error
   */
  export function CacheNotExist(identifier: string): ErrorType {
    return {
      message: `Cache with identifier '${identifier}' doesn't exist`,
      code: 31
    }
  }

  /**
   * Error when queue is empty while trying to start queue cycle
   */
  export const QueueEmpty: ErrorType = {
    message: "Queue is empty",
    code: 40
  }
}

/**
 * Custom error for discord-media-player
 */
export class PlayerError extends Error {
  /**
   * @internal
   */
  public errorCode: number

  /**
   * @param error The error
   */
  constructor(error: ErrorType) {
    validateError(error)
    super(error.message)

    this.errorCode = error.code

    if (Error.captureStackTrace) Error.captureStackTrace(this, PlayerError)
  }

  /**
   * The error code
   */
  get code(): number {
    return this.errorCode
  }
}