"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateTimeout = exports.validatePath = void 0;
const PlayerError_1 = require("./PlayerError");
function validatePath(path) {
    if (typeof path !== "string")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("string", "CacheManager.path", typeof path));
}
exports.validatePath = validatePath;
function validateTimeout(timeout) {
    if (typeof timeout !== "number")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", "CacheManager.timeout", typeof timeout));
    else if (!Number.isInteger(timeout))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotInteger(timeout));
}
exports.validateTimeout = validateTimeout;
