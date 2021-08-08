// Copied from "https://www.npmjs.com/package/soundcloud-downloader"

import type { AxiosInstance } from "axios"
import type { Transcoding } from "./transcoding"
import type { Readable } from "stream"

import m3u8stream from "m3u8stream"
import { STREAMING_PROTOCOLS } from "./transcoding"
import { handleRequestErrs, appendURL, validateMedia } from "./util"

/**
 * Download a specific media transcoding from soundcloud
 * @param media The audio media transcoding
 * @param clientID The soundcloud client id
 * @param axiosInstance The axios instance
 * @returns The audio source stream
 * 
 * Copied from "https://www.npmjs.com/package/soundcloud-downloader"
 */
export async function downloadMedia(media: Transcoding, clientID: string, axiosInstance: AxiosInstance): Promise<Readable | m3u8stream.Stream> {
  if (!validateMedia(media)) throw new Error("Invalid media object provided")

  try {
    const link = appendURL(media.url, "client_id", clientID)
    const res = await axiosInstance.get(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.129 Safari/537.36',
        Accept: '*/*',
        'Accept-Encoding': 'gzip, deflate, br'
      },
      withCredentials: true
    })

    if (!res.data.url) throw new Error(`Invalid response from Soundcloud. Check if the URL provided is correct: ${link}`)

    if (media.format.protocol === STREAMING_PROTOCOLS.PROGRESSIVE) {
      const r = await axiosInstance.get(res.data.url, {
        withCredentials: true,
        responseType: 'stream'
      })

      return r.data
    }

    return m3u8stream(res.data.url)
  } catch (err) {
    throw handleRequestErrs(err)
  }
}