# thad-tracker-discord

Discord bot that reads a Dyno voice-log channel and computes the last calendar
day on which Myles, Trevor, and Thad each had a "joined voice channel" event
(not required to overlap — same day counts). Exposes the result as a unix
timestamp over HTTP.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in `DISCORD_TOKEN` (adjust
   `LOG_CHANNEL_ID`, `PORT`, `SCAN_INTERVAL_HOURS`, `TIMEZONE` if needed).
3. In the [Discord Developer Portal](https://discord.com/developers/applications),
   on your bot's page under **Bot**, enable the **Message Content Intent**.
   Dyno's log entries are embeds, and Discord only sends embed content to bots
   that have this privileged intent enabled.
4. Make sure the bot is in the server with **View Channel** and **Read
   Message History** permissions on the log channel.
5. `npm run dev` (or `npm run build && npm start`).

## HTTP API

- `GET /last-together` → `{ unixTimestamp, date, lastScanAt }`
- `GET /health` → `{ ok, lastScanAt, lastError }`

The tracked user IDs are hardcoded in [src/config.ts](src/config.ts).
