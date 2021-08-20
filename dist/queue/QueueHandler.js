"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueHandler = void 0;
const Queue_1 = require("./Queue");
const validation_1 = require("../validation");
/**
 * The instance to handle audio player and queue
 */
// eslint-disable-next-line @typescript-eslint/ban-types
class QueueHandler {
    /**
     * @param manager The queue manager
     * @param player The handled audio player
     */
    constructor(manager, player) {
        /**
         * The handled queue
         */
        this.queue = new Queue_1.Queue();
        /**
         * @internal
         */
        this._looping = false;
        /**
         * @internal
         */
        this._loopQueue = false;
        /**
         * @internal
         */
        this._paused = false;
        /**
         * @internal
         */
        this._filtered = false;
        /**
         * @internal
         */
        this._volume = 1;
        validation_1.QueueHandlerValidation.validateManager(manager);
        validation_1.QueueHandlerValidation.validatePlayer(player);
        this.manager = manager;
        this._player = player;
        this._player.once("unlink", this._onUnlink.bind(this));
    }
    /**
     * The player linked connection guildID
     */
    get guildID() {
        return this._player.guildID;
    }
    /**
     * The audio player status
     */
    get status() {
        return this._player.status;
    }
    /**
     * The audio player is playing or not
     */
    get playing() {
        return this._player.playing;
    }
    /**
     * The audio volume
     */
    get volume() {
        return this._volume;
    }
    /**
     * The audio player is looping the current audio or not
     */
    get looping() {
        return this._looping;
    }
    /**
     * The queue is looped or not
     */
    get queueLooping() {
        return this._loopQueue;
    }
    /**
     * The current track is paused or not
     */
    get paused() {
        return this._paused;
    }
    /**
     * The audio is filtered or not
     */
    get filtered() {
        return this._filtered;
    }
    /**
     * Set the volume of the audio
     * @param volume The volume
     */
    setVolume(volume) {
        this._player.setVolume(volume);
        this._volume = volume;
    }
    /**
     * Loop the current audio
     * @returns true if looping, otherwise false
     */
    loop() {
        this._looping = this._player.loop();
        return this._looping;
    }
    /**
     * Loop the queue
     * @returns true if looping, otherwise false
     */
    loopQueue() {
        this._checkPlaying();
        this._loopQueue = !this._loopQueue;
        return this._loopQueue;
    }
    /**
     * Pause the current track
     * @returns true if paused, otherwise false
     */
    pause() {
        this._paused = this._player.pause();
        return this._paused;
    }
    /**
     * Filter the audio
     * @param filters The filters (ffmpeg-audiofilters)
     */
    filter(filters) {
        this._player.setFilter(filters);
        this._player.filter();
        this._filtered = true;
    }
    /**
     * If the audio is filtered, unfilter the audio
     */
    unfilter() {
        if (!this._filtered)
            return;
        this._player.setFilter(null);
        this._player.filter();
        this._filtered = false;
    }
    /**
     * Stop the current track
     */
    stop() {
        this._player.stop();
    }
    /**
     * Seek into specific duration of the current track
     * @param seconds Where to seek (in seconds)
     */
    seek(seconds) {
        return this._player.seek(seconds);
    }
    /**
     * Start the queue cycle
     */
    async play() {
        if (this.playing)
            return;
        this._checkQueueEmpty();
        this._attachListener();
        this.manager.emit("queueStart", this.guildID);
        await this._onend();
    }
    /**
     * @internal
     */
    _attachListener() {
        this._detachListener();
        this._onend = this._onEnd.bind(this);
        this._onpause = this._onPause.bind(this);
        this._onunpause = this._onUnpause.bind(this);
        this._player.on("end", this._onend);
        this._player.on("pause", this._onpause);
        this._player.on("unpause", this._onunpause);
    }
    /**
     * @internal
     */
    _detachListener() {
        if (this._onend)
            this._player.off("end", this._onend);
        if (this._onpause)
            this._player.off("pause", this._onpause);
        if (this._onunpause)
            this._player.off("unpause", this._onunpause);
        this._onend = null;
        this._onpause = null;
        this._onunpause = null;
    }
    /**
     * @internal
     */
    async _onEnd() {
        this.queue.current?.cleanup();
        if (this.queue.current) {
            if (this.looping) {
                this.queue.current.setPlayer(this._player);
                return;
            }
            else if (this.queueLooping)
                this.queue.add(this.queue.current);
        }
        const track = this.queue.progress().current;
        if (!track) {
            this._detachListener();
            this.manager.emit("queueEnd", this.guildID);
            return;
        }
        await this._player.play(track.urlOrLocation, track.sourceType);
        track.setPlayer(this._player);
    }
    /**
     * @internal
     */
    _onPause() {
        this.queue.current?.addPausedTimestamp(Date.now());
    }
    /**
     * @internal
     */
    _onUnpause() {
        this.queue.current?.addUnpausedTimestamp(Date.now());
    }
    /**
     * @internal
     */
    _onUnlink() {
        this.manager._deleteHandlerIfExist(this.guildID);
        this._cleanup();
    }
    /**
     * @internal
     */
    _cleanup() {
        if (this.playing)
            this.manager.emit("queueEnd", this.guildID);
        this._detachListener();
        this.queue.clear();
        this._player = null;
    }
    /**
     * @internal
     */
    _checkPlaying() {
        if (!this._player.playing)
            throw new validation_1.PlayerError(validation_1.ErrorMessages.PlayerNotPlaying);
    }
    /**
     * @internal
     */
    _checkQueueEmpty() {
        if (this.queue.length <= 0)
            throw new validation_1.PlayerError(validation_1.ErrorMessages.QueueEmpty);
    }
}
exports.QueueHandler = QueueHandler;
