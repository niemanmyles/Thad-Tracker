import type { Message } from "discord.js";

export interface JoinEvent {
  userId: string;
  timestampMs: number;
}

const JOIN_REGEX = /joined voice channel/i;
const ID_REGEX = /ID:\s*(\d{15,25})/;

/**
 * Dyno posts voice join/leave events as embeds: description names the action,
 * footer carries "ID: <userId>" and the embed timestamp is the event time.
 */
export function parseJoinEvent(message: Message, trackedIds: readonly string[]): JoinEvent | null {
  for (const embed of message.embeds) {
    const description = embed.description ?? "";
    if (!JOIN_REGEX.test(description)) continue;

    const footerText = embed.footer?.text ?? "";
    const idMatch = ID_REGEX.exec(footerText);
    if (!idMatch?.[1]) continue;

    const userId = idMatch[1];
    if (!trackedIds.includes(userId)) continue;

    const timestampMs = embed.timestamp ? Date.parse(embed.timestamp) : message.createdTimestamp;
    return { userId, timestampMs };
  }
  return null;
}
