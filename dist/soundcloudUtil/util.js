"use strict";
// Copied from "https://www.npmjs.com/package/soundcloud-downloader"
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateMedia = exports.appendURL = exports.handleRequestErrs = void 0;
/**
 * Handle axios error
 * @param err The axios error
 * @returns The handle'd axios error
 *
 * Copied from "https://www.npmjs.com/package/soundcloud-downloader"
 */
function handleRequestErrs(err) {
    if (!err.response)
        return err;
    if (!err.response.status)
        return err;
    if (err.response.status === 401)
        err.message += ", is your Client ID correct?";
    if (err.response.status === 404)
        err.message += ", could not find the song... it may be private - check the URL";
    return err;
}
exports.handleRequestErrs = handleRequestErrs;
/**
 * Append parameters into url
 * @param baseURL The base url
 * @param params The parameters
 * @returns The appended url
 *
 * Copied from "https://www.npmjs.com/package/soundcloud-downloader"
 */
function appendURL(baseURL, ...params) {
    const url = new URL(baseURL);
    params.forEach((val, idx) => {
        if (idx % 2 === 0)
            url.searchParams.append(val, params[idx + 1]);
    });
    return url.href;
}
exports.appendURL = appendURL;
/**
 * Validate the media transcoding
 * @param media The media transcoding
 * @returns true if valid, otherwise false
 *
 * Copied from "https://www.npmjs.com/package/soundcloud-downloader"
 */
function validateMedia(media) {
    if (!media.url || !media.format)
        return false;
    return true;
}
exports.validateMedia = validateMedia;
