/**
 * An example of simple music bot made in discord.js v13 with discord-media-player
 */

require("dotenv").config()

const { QueueManager, CacheManagerImpl, Track } = require("discord-media-player")
const queueManager = new QueueManager({
    //cache is optional
    cache: new CacheManagerImpl(),
    //save the cache into specific directory (optional)
    cacheDir: ".cache",
    //delete the cache after unused for 1 minute (optional)
    cacheTimeout: 1000 * 60
})

queueManager.on("audioStart", console.log.bind(console, "AUDIO_START"))
queueManager.on("audioEnd", console.log.bind(console, "AUDIO_END"))
queueManager.on("audioError", console.log.bind(console, "AUDIO_ERROR"))
queueManager.on("queueStart", console.log.bind(console, "QUEUE_START"))
queueManager.on("queueEnd", console.log.bind(console, "QUEUE_END"))

const { Client, Intents } = require("discord.js")
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
})

const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus } = require("@discordjs/voice")

const PREFIX = "!"

client.once("ready", () => console.log("READY"))

client.on("messageCreate", async msg => {
    if (!msg.content.startsWith(PREFIX)) return
    
    const args = msg.content.substring(PREFIX.length).trim().split(" ")
    const command = args.shift()
    
    if (command === "play") {
        if (!args.length) {
            msg.reply(":x: | No query provided")
            return
        }

        const { type, tracks } = await queueManager.youtubeSearch({ query: args.join(" ") })
        
        if (!tracks.length) {
            msg.reply(":x: | No tracks found")
            return
        }
        
        let connection = getVoiceConnection(msg.guild.id)
        
        if (!connection || connection.state.status !== VoiceConnectionStatus.Ready) {
            if (!msg.member.voice.channel) {
                msg.reply(":x: | You must be in a voice channel")
                return
            }
            
            if (!connection) connection = joinVoiceChannel({
                guildId: msg.guild.id,
                channelId: msg.member.voice.channel.id,
                selfDeaf: true,
                adapterCreator: msg.guild.voiceAdapterCreator
            })
            else connection.rejoin({
                channelId: msg.member.voice.channel.id
            })
        }
        
        const handler = queueManager.getHandler(connection)
        
        handler.queue.add(tracks)
        
        if (handler.queue.current) {
            msg.reply(`Added ${type === "playlist" ? "Playlist" : `'${tracks[0].get("title")}'`} to queue`)
            return
        }
        
        await handler.play()
        
        msg.reply(`Now playing ${type === "playlist" ? "Playlist" : `'${tracks[0].get("title")}'`}`)
    } else if (command === "current") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.replY(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const handler = queueManager.getHandler(connection)
        
        if (!handler.queue.current) {
            msg.reply(":x: | No track is currently playing")
            return
        }
        
        msg.reply(`Link: ${handler.queue.current.urlOrLocation}\nPlayed since ${Math.floor(handler.queue.current.playbackDuration / 1000)} seconds ago`)
    } else if (command === "queue") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const handler = queueManager.getHandler(connection)
        
        if (!handler.queue.length) {
            msg.reply(":x: | Queue is empty")
            return
        }
        
        msg.reply(handler.queue.map((track, index) => `${index+1}. \`${track.urlOrLocation}\``).join("\n"))
    } else if (command === "remove") {
        if (!args.length) {
            msg.reply(":x: | Please provide the positions of track in queue you want to remove")
            return
        }
        
        const positions = args.map(position => Number(position))
        
        if (positions.some(position => !Number.isInteger(position) || position <= 0)) {
            msg.reply(":x: | Some provided positions is not valid")
            return
        }
        
        if (positions.some(position => positions.filter(pos => (pos === position)).length > 1)) {
            msg.reply(":x: | Found duplicate of positions")
            return
        }
        
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const handler = queueManager.getHandler(connection)
        
        if (!handler.queue.length) {
            msg.reply(":x: | Queue is empty")
            return
        }
        
        const removed = []
        
        for (const position of positions) {
            const pos = position - 1 - removed.filter(remove => remove < position)
            handler.queue.remove(pos)
            removed.push(pos)
        }
        
        msg.reply(`Removed tracks in position ${positions.join(", ")}`)
    } else if (command === "loop") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const handler = queueManager.getHandler(connection)
        
        if (!handler.playing) {
            msg.reply(":x: | No track is currently playing")
            return
        }
        
        msg.reply(handler.loop() ? "Looping current track" : "Unlooping current track")
    } else if (command === "loopqueue") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const handler = queueManager.getHandler(connection)
        
        if (!handler.playing) {
            msg.reply(":x: | No track is currently playing")
            return
        }
        
        msg.reply(handler.loopQueue() ? "Looping the queue" : "Unlooping the queue")
    } else if (command === "volume") {
        if (!args.length) {
            msg.reply(":x: | Please provide the volume you want to set")
            return
        }
        
        const volume = Number(args[0])
        
        if (Number.isNaN(volume) || volume <= 0) {
            msg.reply(":x: | Provided volume is not valid")
            return
        }
        
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const handler = queueManager.getHandler(connection)
        
        if (!handler.playing) {
            msg.reply(":x: | No track is currently playing")
            return
        }
        
        handler.setVolume(volume)
        
        msg.reply(`Set volume to ${volume}`)
    } else if (command === "soundcloud") {
        if (!args.length) {
            msg.reply(":x: | No query provided")
            return
        }

        const { type, tracks } = await queueManager.soundcloudSearch({ query: args.join(" ") })
        
        if (!tracks.length) {
            msg.reply(":x: | No tracks found")
            return
        }
        
        let connection = getVoiceConnection(msg.guild.id)
        
        if (!connection || connection.state.status !== VoiceConnectionStatus.Ready) {
            if (!msg.member.voice.channel) {
                msg.reply(":x: | You must be in a voice channel")
                return
            }
            
            if (!connection) connection = joinVoiceChannel({
                guildId: msg.guild.id,
                channelId: msg.member.voice.channel.id,
                selfDeaf: true,
                adapterCreator: msg.guild.voiceAdapterCreator
            })
            else connection.rejoin({
                channelId: msg.member.voice.channel.id
            })
        }
        
        const handler = queueManager.getHandler(connection)
        
        handler.queue.add(tracks)
        
        if (handler.queue.current) {
            msg.reply(`Added ${type === "set" ? "Playlist" : `'${tracks[0].get("title")}'`} to queue`)
            return
        }
        
        await handler.play()
        
        msg.reply(`Now playing ${type === "set" ? "Playlist" : `'${tracks[0].get("title")}'`}`)
    } else if (command === "local") {
        if (!args.length) {
            msg.reply(":x: | File name is not provided")
            return
        }
        
        let connection = getVoiceConnection(msg.guild.id)
        
        if (!connection || connection.state.status !== VoiceConnectionStatus.Ready) {
            if (!msg.member.voice.channel) {
                msg.reply(":x: | You must be in a voice channel")
                return
            }
            
            if (!connection) connection = joinVoiceChannel({
                guildId: msg.guild.id,
                channelId: msg.member.voice.channel.id,
                selfDeaf: true,
                adapterCreator: msg.guild.voiceAdapterCreator
            })
            else connection.rejoin({
                channelId: msg.member.voice.channel.id
            })
        }
        
        const handler = queueManager.getHandler(connection)
        const track = new Track({
            sourceType: 2,
            urlOrLocation: args.join(" ")
        })
        
        handler.queue.add(track)
        
        if (handler.queue.current) {
            msg.reply(`Added ${track.urlOrLocation} to queue`)
            return
        }
        
        await handler.play()
        
        msg.reply(`Now playing ${track.urlOrLocation}`)
	} else if (command === "seek") {
        if (!args.length) {
            msg.reply(":x: | Please provide the position of track u want to seek (in seconds)")
            return
        }
        
        const seconds = Number(args[0])
        
        if (!Number.isInteger(seconds) || seconds < 0) {
            msg.reply(":x: | Provided seconds is not valid")
            return
        }
        
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const handler = queueManager.getHandler(connection)
        
        if (!handler.playing) {
            msg.reply(":x: | No track is currently playing")
            return
        }
        
        await handler.seek(seconds)
        
        msg.reply(`Seekened to ${seconds} seconds`)
    } else if (command === "filter") {
        const filter = {
            atempo: "0.85",
            asetrate: "48000*1.2",
            aresample: "48000"
        }
        
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const handler = queueManager.getHandler(connection)
        
        if (!handler.playing) {
            msg.reply(":x: | No track is currently playing")
            return
        }
        
        handler.filter(filter)
        
        msg.reply("Filtered current track")
    } else if (command === "unfilter") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const handler = queueManager.getHandler(connection)
        
        if (!handler.playing) {
            msg.reply(":x: | No track is currently playing")
            return
        }
        
        handler.unfilter()
        
        msg.reply("Unfiltered current track")
    } else if (command === "skip") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const handler = queueManager.getHandler(connection)
        
        if (!handler.playing) {
            msg.reply(":x: | No track is currently playing")
            return
        }
        
        handler.stop()
        
        msg.reply("Skipped current track")
    } else if (command === "stop") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const handler = queueManager.getHandler(connection)
        
        if (!handler.playing) {
            msg.reply(":x: | No track is currently playing")
            return
        }

        if (handler.looping) handler.loop()
        if (handler.queueLooping) handler.loopQueue()
        
        handler.queue.clear()
        handler.stop()
        
        msg.reply("Stopped the queue")
    } else if (command === "clear") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const handler = queueManager.getHandler(connection)
        
        if (!handler.playing) {
            msg.reply(":x: | No track is currently playing")
            return
        }
        
        handler.queue.clear()
        
        msg.reply("Cleared the queue (exluding the current track)")
    } else if (command === "join") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!msg.member.voice.channel) {
            msg.reply(":x: | You must be in a voice channel")
            return
        }

        if (!connection ||
            connection.joinConfig.channelId !== msg.member.voice.channel.id ||
            connection.state.status !== VoiceConnectionStatus.Ready) {
            
            if (!connection) joinVoiceChannel({
                guildId: msg.guild.id,
                channelId: msg.member.voice.channel.id,
                adapterCreator: msg.guild.voiceAdapterCreator,
                selfDeaf: true
            })
            else connection.rejoin({
                channelId: msg.member.voice.channel.id
            })
        } else {
            msg.reply(":x: | Bot is already in voice channel")
            return
        }
        
        msg.reply("Joined voice channel")
    } else if (command === "disconnect") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }

        const handler = queueManager.getHandler(connection)

        handler.queue.clear()

        if (handler.looping) handler.loop()
        if (handler.queueLooping) handler.loopQueue()
        if (handler.playing) handler.stop()
        
        connection.destroy()
        
        msg.reply("Disconnected from voice channel")
    }
})

client.login(process.env.TOKEN)