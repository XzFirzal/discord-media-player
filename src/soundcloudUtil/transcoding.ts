// Copied from "https://www.npmjs.com/package/soundcloud-downloader"

/**
 * The streaming protocols (protocol) of media transcoding
 * 
 * Copied from "https://www.npmjs.com/package/soundcloud-downloader"
 */
export enum STREAMING_PROTOCOLS {
  HLS = "hls",
  PROGRESSIVE = "progressive"
}

/**
 * The format (mime_type) of media transcoding
 * 
 * Copied from "https://www.npmjs.com/package/soundcloud-downloader"
 */
export enum FORMATS {
  MP3 = "audio/mpeg",
  OPUS = "audio/ogg; codecs=\"opus\""
}

/**
 * The interface of media transcoding
 * 
 * Copied from "https://www.npmjs.com/package/soundcloud-downloader"
 */
export interface Transcoding {
  url: string,
  preset: string,
  snipped: boolean,
  format: { protocol: STREAMING_PROTOCOLS, mime_type: FORMATS }
}