import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";
import { TRACKED_USER_IDS } from "./config.js";
import { findLastDayTogether } from "./tracker.js";
import { createServer, type SharedState } from "./server.js";

const {
  DISCORD_TOKEN,
  LOG_CHANNEL_ID,
  PORT = "3000",
  SCAN_INTERVAL_HOURS = "6",
  MAX_MESSAGES_TO_SCAN = "5000",
  TIMEZONE = "UTC",
} = process.env;

if (!DISCORD_TOKEN) throw new Error("DISCORD_TOKEN is required in .env");
if (!LOG_CHANNEL_ID) throw new Error("LOG_CHANNEL_ID is required in .env");

const state: SharedState = { result: null, lastScanAt: null, lastError: null };

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

async function scan(): Promise<void> {
  try {
    const channel = await client.channels.fetch(LOG_CHANNEL_ID as string);
    if (!channel || !channel.isTextBased()) {
      throw new Error(`Channel ${LOG_CHANNEL_ID} is not a readable text channel`);
    }

    const result = await findLastDayTogether(channel, {
      trackedIds: TRACKED_USER_IDS,
      timezone: TIMEZONE,
      maxMessages: Number(MAX_MESSAGES_TO_SCAN),
    });

    state.result = result;
    state.lastScanAt = Date.now();
    state.lastError = null;
    console.log("Scan complete:", result);
  } catch (err) {
    state.lastError = err instanceof Error ? err.message : String(err);
    console.error("Scan failed:", err);
  }
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user?.tag}`);
  void scan();
  setInterval(() => void scan(), Number(SCAN_INTERVAL_HOURS) * 60 * 60 * 1000);
});

createServer(state, Number(PORT));

void client.login(DISCORD_TOKEN);
