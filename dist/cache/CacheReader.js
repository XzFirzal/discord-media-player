"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheReader = void 0;
const stream_1 = require("stream");
const highWaterMark = 1 << 16;
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
        super({ highWaterMark });
        /**
         * @internal
         */
        this._position = -1;
        /**
         * @internal
         */
        this._packet = -1;
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
        this._position += packet.size;
        this.push(buffer.slice(0, bytesRead));
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
            ms += packet.frames * frameSize;
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
