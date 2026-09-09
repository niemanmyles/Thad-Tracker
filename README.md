# Thad-Tracker
A website that tracks when thad last played games with us

## Discord bot outputs

`src/discord-bot` (run via `npm run bot:dev` / `npm run bot:build` + `npm run bot:start`) scans
the Dyno voice-log channel and figures out the last calendar day on which everyone listed in
[`src/discord-bot/config.ts`](src/discord-bot/config.ts) had a "joined voice channel" event —
same day counts, their sessions don't need to overlap. It exposes the result two ways:

### HTTP API

Served on `PORT` (default `3000`, set in `.env.discord-bot`).

#### `GET /last-together`

Returns the most recent qualifying day, if one has been found yet.

```json
{
  "unixTimestamp": 1757315760,
  "date": "2026-09-08",
  "lastScanAt": 1757320000000
}
```

- `unixTimestamp` — seconds since epoch; the latest of the three users' join times on that day
  (i.e. the moment the last of the three showed up)
- `date` — the calendar day, as `YYYY-MM-DD`, in the `TIMEZONE` configured in `.env.discord-bot`
- `lastScanAt` — milliseconds since epoch when the scan that produced this result finished

If no scan has completed yet (bot just started, or every scan so far has errored), the endpoint
responds `503` with `{ "error": "not yet computed" }`.

#### `GET /health`

```json
{
  "ok": true,
  "lastScanAt": 1757320000000,
  "lastError": null
}
```

`lastError` holds the message from the most recent failed scan (e.g. a bad channel ID or missing
permissions), or `null` if the last scan succeeded.

### Console output

On startup and on each scan (once at boot, then every `SCAN_INTERVAL_HOURS`), the bot logs to
stdout/stderr:

```
Logged in as ThadTracker#1234
Scan complete: { dayKey: '2026-09-08', unixTimestamp: 1757315760 }
```

`Scan complete: null` means no day in the scanned history (`MAX_MESSAGES_TO_SCAN` messages back)
had all three tracked users present. A failed scan logs `Scan failed:` with the error instead, and
updates `lastError` above without touching the previous `/last-together` result.
