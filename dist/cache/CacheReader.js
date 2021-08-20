"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheReader = void 0;
const stream_1 = require("stream");
const validation_1 = require("../validation");
const frameSize = 20;
/**
 * An instance to appropriately read opus packet
 */
class CacheReader extends stream_1.Readable {
    /**
     * @param packets The array of packets
     * @param file The file to read
     * @param ms Where to start reading (in ms)
     */
    constructor(packets, file, ms) {
        super();
        /**
         * How many packets has been read (in ms)
         */
        this.packetRead = 0;
        /**
         * @internal
         */
        this._position = -1;
        /**
         * @internal
         */
        this._packet = -1;
        validation_1.CacheReaderValidation.validatePackets(packets);
        validation_1.CacheReaderValidation.validateFileHandle(file);
        validation_1.CacheReaderValidation.validateMs(ms);
        this._packets = packets;
        this._file = file;
        this._ms = ms;
    }
    /**
     * @internal
     */
    async _read() {
        if (this._file instanceof Promise)
            this._file = await this._file;
        if (this._position < 0)
            this._setPosition();
        validation_1.CacheReaderValidation.validateFile(this._file);
        const packet = this._packets[this._packet++];
        if (!packet) {
            this.push(null);
            return;
        }
        const buffer = Buffer.alloc(packet.size);
        const { bytesRead } = await this._file.read(buffer, 0, packet.size, this._position);
        if (!bytesRead) {
            this.push(null);
            return;
        }
        this.packetRead += packet.frames * frameSize;
        this._position += packet.size;
        this.push(buffer);
    }
    /**
     * @internal
     */
    _setPosition() {
        this._position = 0;
        this._packet = 0;
        if (!this._ms)
            return;
        let ms = 0;
        for (let index = 0; index < this._packets.length; ++index) {
            const packet = this._packets[this._packet];
            const packetMs = packet.frames * frameSize;
            ms += packetMs;
            this.packetRead += packetMs;
            this._position += packet.size;
            this._packet++;
            if (ms >= this._ms)
                break;
        }
        if (ms < this._ms)
            this._packet = -1;
    }
}
exports.CacheReader = CacheReader;
