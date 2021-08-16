"use strict";
/* eslint-disable @typescript-eslint/no-namespace */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerError = exports.ErrorMessages = exports.validateError = void 0;
/**
 * Validate the error of PlayerError
 * @param error The error
 */
function validateError(error) {
    if (!("message" in error))
        throw new PlayerError(ErrorMessages.NotProvided("message", "PlayerError.error"));
    else if (typeof error.message !== "string")
        throw new PlayerError(ErrorMessages.Expecting("string", "PlayerError.error.message", typeof error.message));
    if (!("code" in error))
        throw new PlayerError(ErrorMessages.NotProvided("code", "PlayerError.error"));
    else if (typeof error.code !== "number")
        throw new PlayerError(ErrorMessages.Expecting("number", "PlayerError.error.code", typeof error.code));
}
exports.validateError = validateError;
/**
 * Available built-in error messages for PlayerError
 */
var ErrorMessages;
(function (ErrorMessages) {
    /**
     * Error when value is different than expected
     * @param expecting THe expected value
     * @param where Where does the error take place
     * @param got The actual value
     * @returns The error
     */
    function Expecting(expecting, where, got) {
        return {
            message: `Expecting ${Array.isArray(expecting) ? expecting.map((expect) => `'${expect}'`).join(" or ") : `'${expecting}'`} in '${where}', but got ${typeof got === "string"
                ? `'${got}'`
                : typeof got === "number"
                    ? got
                    : got?.constructor?.name || typeof got} instead`,
            code: 0
        };
    }
    ErrorMessages.Expecting = Expecting;
    /**
     * Error when key is not exist in an object
     * @param what The key that expected to exist in the object
     * @param where Where does the error take place
     * @returns The error
     */
    function NotProvided(what, where) {
        return {
            message: `'${what}' is not provided in '${where}'`,
            code: 1
        };
    }
    ErrorMessages.NotProvided = NotProvided;
    /**
     * Error when value is a number but not an integer
     * @param what The value that supposed to be integer
     * @returns The error
     */
    function NotInteger(what) {
        return {
            message: `'${what}' is not an integer`,
            code: 2
        };
    }
    ErrorMessages.NotInteger = NotInteger;
    /**
     * Error when value doesn't have any of the thing
     * @param what The value that must have the thing
     * @param things Some thing that must be on the value atleast one of it
     * @returns The error
     */
    function AtleastHave(what, things) {
        return {
            message: `'${what}' must atleast have ${things.map((thing) => `'${thing}'`).join(" or ")}`,
            code: 3
        };
    }
    ErrorMessages.AtleastHave = AtleastHave;
    /**
     * Error when value is not a valid source type
     * @param sourceType The source type
     * @returns The error
     */
    function NotValidSourceType(sourceType) {
        return {
            message: `'${sourceType}' is not a valid source type`,
            code: 10
        };
    }
    ErrorMessages.NotValidSourceType = NotValidSourceType;
    /**
     * Error when player is already linked
     */
    ErrorMessages.PlayerAlreadyLinked = {
        message: "Player is already linked",
        code: 20
    };
    /**
     * Error when player is not linked
     */
    ErrorMessages.PlayerNotLinked = {
        message: "Player is not linked yet",
        code: 21
    };
    /**
     * Error when player is already playing
     */
    ErrorMessages.PlayerAlreadyPlaying = {
        message: "Player is already playing",
        code: 22
    };
    /**
     * Error when player is not playing
     */
    ErrorMessages.PlayerNotPlaying = {
        message: "Player is not playing yet",
        code: 23
    };
    /**
     * Error when cache with the provided identifier already exist
     * @param identifier The cache identifier
     * @returns The error
     */
    function CacheAlreadyExist(identifier) {
        return {
            message: `Cache with identifier '${identifier}' already exist`,
            code: 30
        };
    }
    ErrorMessages.CacheAlreadyExist = CacheAlreadyExist;
    /**
     * Error when cache with the provided identifier doesn't exist
     * @param identifier The cache identifier
     * @returns The error
     */
    function CacheNotExist(identifier) {
        return {
            message: `Cache with identifier '${identifier}' doesn't exist`,
            code: 31
        };
    }
    ErrorMessages.CacheNotExist = CacheNotExist;
})(ErrorMessages = exports.ErrorMessages || (exports.ErrorMessages = {}));
/**
 * Custom error for discord-media-player
 */
class PlayerError extends Error {
    /**
     * @param error The error
     */
    constructor(error) {
        validateError(error);
        super(error.message);
        this.errorCode = error.code;
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, PlayerError);
    }
    /**
     * The error code
     */
    get code() {
        return this.errorCode;
    }
}
exports.PlayerError = PlayerError;
