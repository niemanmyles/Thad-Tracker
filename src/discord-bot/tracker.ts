import type { TextBasedChannel } from "discord.js";
import { parseJoinEvent } from "./logParser.js";

export interface TogetherResult {
  dayKey: string;
  unixTimestamp: number;
}

interface ScanOptions {
  trackedIds: readonly string[];
  timezone: string;
  maxMessages: number;
  pageSize?: number;
}

function dayKeyFor(timestampMs: number, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestampMs));
}

/**
 * Scans a Dyno voice-log channel backward from the present, grouping "joined
 * voice channel" events by calendar day, and returns the most recent day on
 * which every tracked user has at least one join event. A day is only
 * evaluated once scanning has moved past it (older messages can't add to it),
 * so the first qualifying day found while going backward is the answer.
 */
export async function findLastDayTogether(
  channel: TextBasedChannel,
  { trackedIds, timezone, maxMessages, pageSize = 100 }: ScanOptions,
): Promise<TogetherResult | null> {
  let beforeId: string | undefined;
  let scanned = 0;

  let currentDayKey: string | null = null;
  let currentDayTimestamps = new Map<string, number>();

  const checkDayComplete = (): TogetherResult | null => {
    if (currentDayKey && currentDayTimestamps.size === trackedIds.length) {
      const unixTimestamp = Math.floor(Math.max(...currentDayTimestamps.values()) / 1000);
      return { dayKey: currentDayKey, unixTimestamp };
    }
    return null;
  };

  while (scanned < maxMessages) {
    const batch = await channel.messages.fetch({
      limit: pageSize,
      ...(beforeId ? { before: beforeId } : {}),
    });
    if (batch.size === 0) break;

    for (const message of batch.values()) {
      scanned++;
      const event = parseJoinEvent(message, trackedIds);
      if (!event) continue;

      const dayKey = dayKeyFor(event.timestampMs, timezone);

      if (currentDayKey === dayKey) {
        if (!currentDayTimestamps.has(event.userId)) {
          currentDayTimestamps.set(event.userId, event.timestampMs);
        }
        continue;
      }

      if (currentDayKey !== null) {
        const result = checkDayComplete();
        if (result) return result;
      }

      currentDayKey = dayKey;
      currentDayTimestamps = new Map([[event.userId, event.timestampMs]]);
    }

    const oldest = batch.last();
    if (!oldest || batch.size < pageSize) break;
    beforeId = oldest.id;
  }

  return checkDayComplete();
}
