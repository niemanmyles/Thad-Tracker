// Track the squad morale meter for Thad tracker.

import { MORALE_SEGMENTS, getLostSegments } from "./morale";

interface SquadMoraleProps {
    days: number;
}

export function SquadMorale({ days }: SquadMoraleProps) {
    const lostSegments = getLostSegments(days);

    return (
        <>
            <div className="hud-section-label">Squad morale</div>
            <div className="hud-morale">
                {Array.from({ length: MORALE_SEGMENTS }, (_, i) => (
                    <div
                        key={i}
                        className={`hud-morale-segment ${i < lostSegments ? "is-lost" : "is-ok"}`}
                    />
                ))}
            </div>
        </>
    );
}
