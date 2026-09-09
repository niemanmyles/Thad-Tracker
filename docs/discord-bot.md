# Discord bot

Discord bot that reads a Dyno voice-log channel and computes the last calendar
day on which Myles, Trevor, and Thad each had a "joined voice channel" event
(not required to overlap — same day counts). Exposes the result as a unix
timestamp over HTTP.

Source lives at [src/discord-bot](../src/discord-bot).

## Setup

1. `npm install` (from the repo root — installs both the website and the bot).
2. Copy `.env.discord-bot.example` to `.env.discord-bot` and fill in
   `DISCORD_TOKEN` (adjust `LOG_CHANNEL_ID`, `PORT`, `SCAN_INTERVAL_HOURS`,
   `TIMEZONE` if needed).
3. In the [Discord Developer Portal](https://discord.com/developers/applications),
   on your bot's page under **Bot**, enable the **Message Content Intent**.
   Dyno's log entries are embeds, and Discord only sends embed content to bots
   that have this privileged intent enabled.
4. Make sure the bot is in the server with **View Channel** and **Read
   Message History** permissions on the log channel.
5. `npm run bot:dev` (or `npm run bot:build && npm run bot:start`).

## HTTP API

- `GET /last-together` → `{ unixTimestamp, date, lastScanAt }`
- `GET /health` → `{ ok, lastScanAt, lastError }`

The tracked user IDs are hardcoded in
[src/discord-bot/config.ts](../src/discord-bot/config.ts).
