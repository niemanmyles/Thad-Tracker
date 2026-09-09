// Track thad's last calls

import { SquadMorale } from "./SquadMorale";
import { DaysSinceBar } from "./DaysSinceBar";
import { WarningIcon } from "./WarningIcon";
import { getMoraleTier } from "./morale";

interface CallTrackerProps {
    getLastCallDate: () => Date;
}

function daysSince(date: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Date.now() - date.getTime();
    return Math.floor(diff / msPerDay);
}

export function CallTracker({ getLastCallDate }: CallTrackerProps) {
    const days: number = daysSince(getLastCallDate());
    const moraleTier = getMoraleTier(days);

    return (
        <div className="hud">
            <div className="hud-eyebrow">Despair Approaching</div>
            <div className="hud-title" style={{ color: moraleTier.color }}>{moraleTier.label}</div>

            <SquadMorale days={days} />
            <DaysSinceBar days={days} />
            <WarningIcon />
        </div>
    );
}
