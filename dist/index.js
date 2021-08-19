"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtil = exports.SoundcloudUtil = exports.Util = exports.version = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-namespace */
const fs_1 = require("fs");
/**
 * The current installed version of the package
 */
exports.version = JSON.parse(fs_1.readFileSync("package.json", "utf-8")).version;
__exportStar(require("./audio/AudioManager"), exports);
__exportStar(require("./audio/AudioPlayer"), exports);
__exportStar(require("./audio/AudioPlayerImpl"), exports);
__exportStar(require("./cache/Cache"), exports);
__exportStar(require("./cache/CacheManager"), exports);
__exportStar(require("./cache/CacheManagerImpl"), exports);
__exportStar(require("./cache/CacheWriter"), exports);
__exportStar(require("./cache/CacheReader"), exports);
__exportStar(require("./cache/PacketReader"), exports);
const _ErrorCode = __importStar(require("./util/ErrorCode"));
const _noop = __importStar(require("./util/noop"));
const _Resource = __importStar(require("./util/Resource"));
const _Skipper = __importStar(require("./util/Skipper"));
const _SourceType = __importStar(require("./util/SourceType"));
/**
 * Package helper utility
 */
var Util;
(function (Util) {
    Util.ErrorCode = _ErrorCode.ErrorCode;
    Util.noop = _noop.noop;
    Util.Resource = _Resource.Resource;
    Util.Skipper = _Skipper.Skipper;
    Util.SourceType = _SourceType.SourceType;
})(Util = exports.Util || (exports.Util = {}));
const _downloadMedia = __importStar(require("./soundcloudUtil/downloadMedia"));
const _transcoding = __importStar(require("./soundcloudUtil/transcoding"));
const _util = __importStar(require("./soundcloudUtil/util"));
/**
 * Soundcloud (soundcloud-downloader) utility
 *
 * Copied from "https://www.npmjs.com/package/soundcloud-downloader"
 */
var SoundcloudUtil;
(function (SoundcloudUtil) {
    SoundcloudUtil.downloadMedia = _downloadMedia.downloadMedia;
    SoundcloudUtil.appendURL = _util.appendURL;
    SoundcloudUtil.handleRequestErrs = _util.handleRequestErrs;
    SoundcloudUtil.validateMedia = _util.validateMedia;
    SoundcloudUtil.FORMATS = _transcoding.FORMATS;
    SoundcloudUtil.STREAMING_PROTOCOLS = _transcoding.STREAMING_PROTOCOLS;
})(SoundcloudUtil = exports.SoundcloudUtil || (exports.SoundcloudUtil = {}));
exports.ValidationUtil = __importStar(require("./validation"));
__exportStar(require("./queue"), exports);
