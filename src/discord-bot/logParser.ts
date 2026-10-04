import type { Message } from "discord.js";

export interface VoiceEvent {
  userId: string;
  timestampMs: number;
  /** Channel the user was in before the event (null if they weren't in voice). */
  fromChannelId: string | null;
  /** Channel the user is in after the event (null if they left voice). */
  toChannelId: string | null;
}

const JOIN_REGEX = /joined voice channel <#(\d+)>/i;
const LEAVE_REGEX = /left voice channel <#(\d+)>/i;
const SWITCH_REGEX = /switched voice channels? <#(\d+)>\s*->\s*<#(\d+)>/i;
const ID_REGEX = /ID:\s*(\d{15,25})/;

function parseChannels(description: string): Pick<VoiceEvent, "fromChannelId" | "toChannelId"> | null {
  const join = JOIN_REGEX.exec(description);
  if (join?.[1]) return { fromChannelId: null, toChannelId: join[1] };

  const leave = LEAVE_REGEX.exec(description);
  if (leave?.[1]) return { fromChannelId: leave[1], toChannelId: null };

  const switched = SWITCH_REGEX.exec(description);
  if (switched?.[1] && switched[2]) return { fromChannelId: switched[1], toChannelId: switched[2] };

  return null;
}

/**
 * Dyno posts voice join/leave/switch events as embeds: description names the
 * action and channel(s) (e.g. "<@user> switched voice channels <#a> -> <#b>"),
 * footer carries "ID: <userId>" and the embed timestamp is the event time.
 */
export function parseVoiceEvent(message: Message, trackedIds: readonly string[]): VoiceEvent | null {
  for (const embed of message.embeds) {
    const channels = parseChannels(embed.description ?? "");
    if (!channels) continue;

    const footerText = embed.footer?.text ?? "";
    const idMatch = ID_REGEX.exec(footerText);
    if (!idMatch?.[1]) continue;

    const userId = idMatch[1];
    if (!trackedIds.includes(userId)) continue;

    const timestampMs = embed.timestamp ? Date.parse(embed.timestamp) : message.createdTimestamp;
    return { userId, timestampMs, ...channels };
  }
  return null;
}
