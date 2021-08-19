/**
 * An example of raw implementation of audio player, made in discord.js v13 with discord-media-player
 */

require("dotenv").config()

const { AudioManager, CacheManagerImpl } = require("discord-media-player")
const audioManager = new AudioManager({
    //cache is optional
    cache: new CacheManagerImpl(),
    //save the cache into specific directory (optional)
    cacheDir: ".cache",
    //delete the cache after unused for 1 minute (optional)
    cacheTimeout: 1000 * 60
})

audioManager.on("audioStart", console.log.bind(console, "AUDIO_START"))
audioManager.on("audioEnd", console.log.bind(console, "AUDIO_END"))
audioManager.on("audioError", console.log.bind(console, "AUDIO_ERROR"))

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
            msg.reply(":x: | Please provide a youtube video url")
            return
        }
        
        const url = args[0]
        
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
        
        const player = audioManager.getPlayer(connection)
        
        if (player.playing) player.stop()
        
        await player.play(url, 0)
        
        msg.reply(`Started playing ${url}`)
    } else if (command === "soundcloud") {
        if (!args.length) {
            msg.reply(":x: | Please provide a soundcloud track url")
            return
        }
        
        const url = args[0]
        
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
        
        const player = audioManager.getPlayer(connection)
        
        if (player.playing) player.stop()
        
        await player.play(url, 1)
        
        msg.reply(`Started playing ${url}`)
    } else if (command === "local") {
        if (!args.length) {
            msg.reply(":x: | Please provide the file location")
            return
        }
        
        const location = args[0]
        
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
        
        const player = audioManager.getPlayer(connection)
        
        if (player.playing) player.stop()
        
        await player.play(location, 2)
        
        msg.reply(`Started playing ${location}`)
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
        
        connection.destroy()
        
        msg.reply("Disconnected from voice channel")
    } else if (command === "loop") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const player = audioManager.getPlayer(connection)
        
        if (!player.playing) {
            msg.reply(":x: | No audio is currently playing")
            return
        }
        
        msg.reply(player.loop() ? "Looping the audio" : "Unlooping the audio")
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
        
        const player = audioManager.getPlayer(connection)
        
        if (!player.playing) {
            msg.reply(":x: | No audio is currently playing")
            return
        }
        
        player.setVolume(volume)
        
        msg.reply(`Set volume to ${volume}`)
    } else if (command === "seek") {
        if (!args.length) {
            msg.reply(":x: | Please provide the position of audio u want to seek (in seconds)")
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
        
        const player = audioManager.getPlayer(connection)
        
        if (!player.playing) {
            msg.reply(":x: | No audio is currently playing")
            return
        }
        
        await player.seek(seconds)
        
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
        
        const player = audioManager.getPlayer(connection)
        
        if (!player.playing) {
            msg.reply(":x: | No audio is currently playing")
            return
        }
        
        player.setFilter(filter)
        player.filter()
        
        msg.reply("Filtered the audio")
    } else if (command === "unfilter") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const player = audioManager.getPlayer(connection)
        
        if (!player.playing) {
            msg.reply(":x: | No audio is currently playing")
            return
        }
        
        player.setFilter(null)
        player.filter()
        
        msg.reply("Unfiltered the audio")
    } else if (command === "stop") {
        const connection = getVoiceConnection(msg.guild.id)
        
        if (!connection) {
            msg.reply(":x: | Bot is not connected to a voice channel")
            return
        }
        
        const player = audioManager.getPlayer(connection)
        
        if (!player.playing) {
            msg.reply(":x: | No audio is currently playing")
            return
        }
        
        player.stop()
        
        msg.reply("Stopped the audio")
    }
})

client.login(process.env.TOKEN)