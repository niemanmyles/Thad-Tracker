import type { TextBasedChannel } from "discord.js";
import { parseVoiceEvent, type VoiceEvent } from "./logParser.js";

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
 * Replays voice events (oldest first) and returns the most recent instant at
 * which every tracked user was in the same voice channel: the moment that
 * overlap ended, or `nowMs` if it's still going. Each user's starting channel
 * is inferred from their first event (a "left #x" means they were in #x), so
 * a user with no events in the window can never count as present.
 */
function lastMomentTogether(events: readonly VoiceEvent[], trackedIds: readonly string[], nowMs: number): number | null {
  const location = new Map<string, string | null>();
  for (const event of events) {
    if (!location.has(event.userId)) location.set(event.userId, event.fromChannelId);
  }
  if (location.size < trackedIds.length) return null;

  const allTogether = (): boolean => {
    const first = location.get(trackedIds[0]!);
    return first != null && trackedIds.every((id) => location.get(id) === first);
  };

  let lastEndMs: number | null = null;
  let together = allTogether();
  for (const event of events) {
    location.set(event.userId, event.toChannelId);
    const nowTogether = allTogether();
    if (together && !nowTogether) lastEndMs = event.timestampMs;
    together = nowTogether;
  }

  return together ? nowMs : lastEndMs;
}

/**
 * Scans a Dyno voice-log channel backward from the present, collecting
 * join/leave/switch events for the tracked users, and returns the most recent
 * moment they were all in the same voice channel at the same time. Older
 * messages can only reveal earlier overlaps, so the scan stops as soon as the
 * collected window contains one.
 */
export async function findLastDayTogether(
  channel: TextBasedChannel,
  { trackedIds, timezone, maxMessages, pageSize = 100 }: ScanOptions,
): Promise<TogetherResult | null> {
  const nowMs = Date.now();
  const newestFirst: VoiceEvent[] = [];
  let beforeId: string | undefined;
  let scanned = 0;

  while (scanned < maxMessages) {
    const batch = await channel.messages.fetch({
      limit: pageSize,
      ...(beforeId ? { before: beforeId } : {}),
    });
    if (batch.size === 0) break;

    for (const message of batch.values()) {
      scanned++;
      const event = parseVoiceEvent(message, trackedIds);
      if (event) newestFirst.push(event);
    }

    const momentMs = lastMomentTogether([...newestFirst].reverse(), trackedIds, nowMs);
    if (momentMs !== null) {
      return { dayKey: dayKeyFor(momentMs, timezone), unixTimestamp: Math.floor(momentMs / 1000) };
    }

    const oldest = batch.last();
    if (!oldest || batch.size < pageSize) break;
    beforeId = oldest.id;
  }

  return null;
}
