"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PacketReader = void 0;
const stream_1 = require("stream");
/**
 * An instance to mark the packet size and frames in packet
 */
class PacketReader extends stream_1.Transform {
    /**
     * @param packets The allocated array of packets
     */
    constructor(packets) {
        super();
        this._packets = packets;
    }
    /**
     * @internal
     */
    _transform(packet, _, cb) {
        let frameCount = packet.readUInt8() & 3;
        if (frameCount === 3)
            frameCount = packet.readUInt8(1) & 63;
        else
            frameCount = frameCount > 0 ? 2 : 1;
        this.push(packet);
        this._packets.push({
            size: packet.length,
            frames: frameCount
        });
        cb();
    }
}
exports.PacketReader = PacketReader;
