"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePlayer = exports.validateManager = void 0;
const PlayerValidation_1 = require("./PlayerValidation");
const PlayerError_1 = require("./PlayerError");
const queue_1 = require("../queue");
// eslint-disable-next-line @typescript-eslint/ban-types
function validateManager(manager) {
    if (typeof manager !== "object" || manager === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "QueueHandler.manager", manager === null ? "null" : typeof manager));
    else if (!(manager instanceof queue_1.QueueManager))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("QueueManager", "QueueHandler.manager", manager));
}
exports.validateManager = validateManager;
function validatePlayer(player) {
    PlayerValidation_1.validatePlayer(player, "QueueHandler.player");
}
exports.validatePlayer = validatePlayer;
