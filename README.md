# discord-media-player

[![NPM Version](https://img.shields.io/npm/v/discord-media-player.svg?maxAge=3600)](https://www.npmjs.com/package/discord-media-player)
[![NPM Downloads](https://img.shields.io/npm/dt/discord-media-player.svg?maxAge=3600)](https://www.npmjs.com/package/discord-media-player)

## Table Of Contents
- [About](#about)
- [Dependencies](#dependencies)
  - [Opus](#opus-libraries) (Required)
  - [Encryption](#encryption-libraries) (Required)
  - [FFmpeg](#ffmpeg) (Optional)
- [Examples](#examples)
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

## Examples
- [Simple Player](https://github.com/XzFirzal/discord-media-player/blob/main/examples/simple_player.js)
- [Simple Music Bot](https://github.com/XzFirzal/discord-media-player/blob/main/examples/simple_music_bot.js)

## Links
- [Documentation](https://XzFirzal.github.io/discord-media-player/stable/index.html)
- [Documentation (Development)](https://XzFirzal.github.io/discord-media-player/index.html)
- [Source Code](https://github.com/XzFirzal/discord-media-player)

## Contributing
Suggestion will most likely won't be accepted.

Before creating an issue, ensure it hasn't already been reported, and double-check the [Documentation](#https://XzFirzal.github.io/discord-media-player/stable/index.html).

See [CONTRIBUTING.md](https://github.com/XzFirzal/discord-media-player/blob/main/.github/CONTRIBUTING.md) before submitting Pull Request.