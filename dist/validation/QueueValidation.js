"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRemove = exports.validateTrack = void 0;
const PlayerError_1 = require("./PlayerError");
const queue_1 = require("../queue");
// eslint-disable-next-line @typescript-eslint/ban-types
function validateTrack(track) {
    if (typeof track !== "object" || track === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "Queue.add.track", track === null ? "null" : typeof track));
    else if (!(track instanceof queue_1.Track))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("Track", "Queue.add.track", track));
}
exports.validateTrack = validateTrack;
function validateRemove(what, value) {
    if (typeof value !== "number")
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("number", `Queue.remove.${what}`, typeof value));
    else if (!Number.isInteger(value))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.NotInteger(value));
}
exports.validateRemove = validateRemove;
