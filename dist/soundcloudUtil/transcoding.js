"use strict";
// Copied from "https://www.npmjs.com/package/soundcloud-downloader"
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORMATS = exports.STREAMING_PROTOCOLS = void 0;
/**
 * The streaming protocols (protocol) of media transcoding
 *
 * Copied from "https://www.npmjs.com/package/soundcloud-downloader"
 */
var STREAMING_PROTOCOLS;
(function (STREAMING_PROTOCOLS) {
    STREAMING_PROTOCOLS["HLS"] = "hls";
    STREAMING_PROTOCOLS["PROGRESSIVE"] = "progressive";
})(STREAMING_PROTOCOLS = exports.STREAMING_PROTOCOLS || (exports.STREAMING_PROTOCOLS = {}));
/**
 * The format (mime_type) of media transcoding
 *
 * Copied from "https://www.npmjs.com/package/soundcloud-downloader"
 */
var FORMATS;
(function (FORMATS) {
    FORMATS["MP3"] = "audio/mpeg";
    FORMATS["OPUS"] = "audio/ogg; codecs=\"opus\"";
})(FORMATS = exports.FORMATS || (exports.FORMATS = {}));
