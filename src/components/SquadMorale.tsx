// Track the squad morale meter for Thad tracker.

import { MORALE_SEGMENTS, MORALE_SEGMENT_COLORS, getLostSegments } from "./morale";

interface SquadMoraleProps {
    days: number;
}

export function SquadMorale({ days }: SquadMoraleProps) {
    const lostSegments = getLostSegments(days);

    return (
        <>
            <div className="hud-section-label">Squad morale</div>
            <div className="hud-morale">
                {Array.from({ length: MORALE_SEGMENTS }, (_, i) => {
                    const isDepleted = i >= MORALE_SEGMENTS - lostSegments;
                    return (
                        <div
                            key={i}
                            className={`hud-morale-segment ${isDepleted ? "is-depleted" : "is-ok"}`}
                            style={isDepleted ? undefined : { background: MORALE_SEGMENT_COLORS[i] }}
                        />
                    );
                })}
            </div>
        </>
    );
}
