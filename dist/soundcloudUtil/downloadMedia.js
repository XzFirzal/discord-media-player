"use strict";
// Copied from "https://www.npmjs.com/package/soundcloud-downloader"
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadMedia = void 0;
const m3u8stream_1 = __importDefault(require("m3u8stream"));
const transcoding_1 = require("./transcoding");
const util_1 = require("./util");
/**
 * Download a specific media transcoding from soundcloud
 * @param media The audio media transcoding
 * @param clientID The soundcloud client id
 * @param axiosInstance The axios instance
 * @returns The audio source stream
 *
 * Copied from "https://www.npmjs.com/package/soundcloud-downloader"
 */
async function downloadMedia(media, clientID, axiosInstance) {
    if (!util_1.validateMedia(media))
        throw new Error("Invalid media object provided");
    try {
        const link = util_1.appendURL(media.url, "client_id", clientID);
        const res = await axiosInstance.get(link, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
                Accept: '*/*',
                'Accept-Encoding': 'gzip, deflate, br'
            },
            withCredentials: true
        });
        if (!res.data.url)
            throw new Error(`Invalid response from Soundcloud. Check if the URL provided is correct: ${link}`);
        if (media.format.protocol === transcoding_1.STREAMING_PROTOCOLS.PROGRESSIVE) {
            const r = await axiosInstance.get(res.data.url, {
                withCredentials: true,
                responseType: 'stream'
            });
            return r.data;
        }
        return m3u8stream_1.default(res.data.url);
    }
    catch (err) {
        throw util_1.handleRequestErrs(err);
    }
}
exports.downloadMedia = downloadMedia;
