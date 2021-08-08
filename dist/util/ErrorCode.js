"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
/**
 * The error codes of audio player
 */
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["noFormatOrMedia"] = 0] = "noFormatOrMedia";
    ErrorCode[ErrorCode["cannotOpenFile"] = 1] = "cannotOpenFile";
    ErrorCode[ErrorCode["youtubeNoPlayerResponse"] = 2] = "youtubeNoPlayerResponse";
    ErrorCode[ErrorCode["youtubeUnplayable"] = 3] = "youtubeUnplayable";
    ErrorCode[ErrorCode["youtubeLoginRequired"] = 4] = "youtubeLoginRequired";
    ErrorCode[ErrorCode["noResource"] = 5] = "noResource";
})(ErrorCode = exports.ErrorCode || (exports.ErrorCode = {}));
