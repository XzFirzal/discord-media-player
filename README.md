# discord-media-player

[![NPM Version](https://img.shields.io/npm/v/discord-media-player.svg?maxAge=3600)](https://www.npmjs.com/package/discord-media-player)
[![NPM Downloads](https://img.shields.io/npm/dt/discord-media-player.svg?maxAge=3600)](https://www.npmjs.com/package/discord-media-player)

## Table Of Contents
- [About](#about)
- [Dependencies](#dependencies)
  - [Opus](#opus-libraries) (Required)
  - [Encryption](#encryption-libraries) (Required)
  - [FFmpeg](#ffmpeg) (Optional)
- [Example](#example)
- [Links](#links)
- [Contributing](#contributing)

## About
[@discordjs/voice](https://npmjs.com/package/@discordjs/voice) wrapper to manage the audio resource easier

With some additional features like caching
and utility method as:
- Looping
- Filtering
- Seeking

## Dependencies
### Opus Libraries
Required, install one of the following:
- @discordjs/opus (Recommended)
- node-opus
- opusscript

### Encryption Libraries
Required, install one of the following:
- sodium
- libsodium-wrappers
- tweetnacl

### FFmpeg
Optional, choose one of the following:
- [FFmpeg](https://www.ffmpeg.org/download.html) (Install manually on the machine)
- npm install ffmpeg-static

FFmpeg is used for audio filters, arbitrary source, and fallback when no opus format found.

## Example
This is an example of simple music bot using discord.js v13 with discord-media-player
```js
const { AudioManager, CacheManagerImpl } = require("discord-media-player")
const audioManager = new AudioManager({
  //cache is optional
  cache: new CacheManagerImpl()
})

const { Client, Intents } = require("discord.js")
const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
})

const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus } = require("@discordjs/voice")

client.on("messageCreate", async message => {
  /**
   * You need to make your queue implementation to use queue
   */

  if (message.content.startsWith("!play")) {
    const url = message.content.replace("!play", "")

    let connection = getVoiceConnection(message.guild.id)

    if (!connection || [VoiceConnectionStatus.Disconnected, VoiceConnectionStatus.Destroyed].includes(connection._state.status)) {
      if (!message.member.voice.channel) {
        message.reply("You must be in a voice channel")
        return
      }

      connection = joinVoiceChannel({
        channelId: message.member.voice.channel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator
      })
    }

    const player = audioManager.getPlayer(connection)

    if (player.status === "playing") player.stop()

    await player.play(url, 0)

    message.reply(`Playing ${url}`)
  } else if (message.content.startsWith("!stop")) {
    const connection = getVoiceConnection(message.guild.id)

    if (!connection) {
      message.reply("Bot is not in any voice channel")
      return
    }

    const player = audioManager.getPlayer(connection)

    if (!["playing", "buffering", "paused"].includes(player.status)) {
      message.reply("Player is not playing")
      return
    }

    player.stop()

    message.reply("Player stopped")
  }
})

client.login(process.env.TOKEN)
```

## Links
- [Documentation](https://XzFirzal.github.io/discord-media-player/stable/index.html)
- [Documentation (Development)](https://XzFirzal.github.io/discord-media-player/index.html)
- [Source Code](https://github.com/XzFirzal/discord-media-player)

## Contributing
Suggestion will most likely won't be accepted.

Before creating an issue, ensure it hasn't already been reported, and double-check the [Documentation](#https://XzFirzal.github.io/discord-media-player/stable/index.html).

See [CONTRIBUTING.md](https://github.com/XzFirzal/discord-media-player/blob/main/.github/CONTRIBUTING.md) before submitting Pull Request.