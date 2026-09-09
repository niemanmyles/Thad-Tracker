// Shared squad morale tier logic for Thad tracker.

export const MORALE_SEGMENTS = 5;
export const MORALE_DAYS_PER_SEGMENT = 3;

export function getLostSegments(days: number): number {
    return Math.min(MORALE_SEGMENTS, Math.floor(days / MORALE_DAYS_PER_SEGMENT));
}

const MORALE_TIERS = [
    { label: "Stable", color: "#7fd058" },
    { label: "Worried", color: "#ffd166" },
    { label: "Anxious", color: "#e8944a" },
    { label: "Dread", color: "#e8663a" },
    { label: "Doomed", color: "#d64545" },
] as const satisfies { label: string; color: string }[];

export function getMoraleTier(days: number): (typeof MORALE_TIERS)[number] {
    const index = Math.min(getLostSegments(days), MORALE_TIERS.length - 1);
    return MORALE_TIERS.at(index) ?? MORALE_TIERS[4];
}

// Left-to-right gradient (red to green) for the remaining, non-depleted segments.
export const MORALE_SEGMENT_COLORS = [
    "#d64545",
    "#e8663a",
    "#e8944a",
    "#ffd166",
    "#7fd058",
] as const satisfies readonly string[];

// image1 = highest morale, image5 = lowest morale.
const MORALE_IMAGES = [
    "/images/image1.png",
    "/images/image2.png",
    "/images/image3.png",
    "/images/image4.png",
    "/images/image5.png",
] as const satisfies readonly string[];

export function getMoraleImage(days: number): string {
    const index = Math.min(getLostSegments(days), MORALE_IMAGES.length - 1);
    return MORALE_IMAGES.at(index) ?? MORALE_IMAGES[4];
}
