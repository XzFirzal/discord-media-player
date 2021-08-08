/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */
import { readFileSync } from "fs"

/**
 * The current installed version of the package
 */
export const version: string = JSON.parse(readFileSync("package.json", "utf-8")).version

export * from "./audio/AudioManager"
export * from "./audio/AudioPlayer"
export * from "./audio/AudioPlayerImpl"
export * from "./cache/Cache"
export * from "./cache/CacheManager"
export * from "./cache/CacheManagerImpl"
export * from "./cache/CacheWriter"

import * as _ErrorCode from "./util/ErrorCode"
import * as _Filters from "./util/Filters"
import * as _noop from "./util/noop"
import * as _Resource from "./util/Resource"
import * as _Skipper from "./util/Skipper"
import * as _SourceType from "./util/SourceType"

/**
 * Package helper utility
 */
export namespace Util {
  export import ErrorCode = _ErrorCode.ErrorCode
  export import Filters = _Filters.Filters
  export import noop = _noop.noop
  export import Resource = _Resource.Resource
  export import ResourceOptions = _Resource.ResourceOptions
  export import Skipper = _Skipper.Skipper
  export import SourceType = _SourceType.SourceType
}

import * as _downloadMedia from "./soundcloudUtil/downloadMedia"
import * as _transcoding from "./soundcloudUtil/transcoding"
import * as _util from "./soundcloudUtil/util"

/**
 * Soundcloud (soundcloud-downloader) utility
 * 
 * Copied from "https://www.npmjs.com/package/soundcloud-downloader"
 */
export namespace SoundcloudUtil {
  export import downloadMedia = _downloadMedia.downloadMedia
  export import appendURL = _util.appendURL
  export import handleRequestErrs = _util.handleRequestErrs
  export import validateMedia = _util.validateMedia
  export import FORMATS = _transcoding.FORMATS
  export import STREAMING_PROTOCOLS = _transcoding.STREAMING_PROTOCOLS
  export import Transcoding = _transcoding.Transcoding
}