"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePackets = void 0;
const PlayerError_1 = require("./PlayerError");
function validatePackets(packets) {
    if (typeof packets !== "object" || packets === null)
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("object", "PacketReader.packets", packets === null ? "null" : typeof packets));
    else if (!Array.isArray(packets))
        throw new PlayerError_1.PlayerError(PlayerError_1.ErrorMessages.Expecting("Array", "PacketReader.packets", packets));
}
exports.validatePackets = validatePackets;
