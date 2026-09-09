// Shared squad morale tier logic for Thad tracker.

export const MORALE_SEGMENTS = 5;
export const MORALE_DAYS_PER_SEGMENT = 7;

export function getLostSegments(days: number): number {
    return Math.min(MORALE_SEGMENTS, Math.floor(days / MORALE_DAYS_PER_SEGMENT));
}

const MORALE_TIERS = [
    { label: "Stable", color: "#7fd058" },
    { label: "Uneasy", color: "#b5d058" },
    { label: "Worried", color: "#ffd166" },
    { label: "Anxious", color: "#e8944a" },
    { label: "Dread", color: "#e8663a" },
    { label: "Doomed", color: "#d64545" },
] as const satisfies { label: string; color: string }[];

export function getMoraleTier(days: number): (typeof MORALE_TIERS)[number] {
    const index = getLostSegments(days);
    return MORALE_TIERS[index as 0 | 1 | 2 | 3 | 4 | 5];
}
