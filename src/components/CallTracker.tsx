// Track thad's last calls

import { useEffect, useState } from "react";
import { SquadMorale } from "./SquadMorale";
import { DaysSinceBar } from "./DaysSinceBar";
import { WarningIcon } from "./WarningIcon";
import { getMoraleImage, getMoraleTier } from "./morale";

interface LastTogetherResponse {
    unixTimestamp: number;
    date: string;
    lastScanAt: number;
}

function daysSince(date: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const diff = Date.now() - date.getTime();
    return Math.floor(diff / msPerDay);
}

export function CallTracker() {
    const [days, setDays] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetch("/last-together")
            .then(async (res) => {
                if (res.status === 503) {
                    throw new Error("not yet computed");
                }
                if (!res.ok) {
                    throw new Error(`request failed: ${res.status}`);
                }
                return (await res.json()) as LastTogetherResponse;
            })
            .then((data) => {
                if (cancelled) return;
                setDays(daysSince(new Date(data.unixTimestamp * 1000)));
                setError(null);
            })
            .catch((err: Error) => {
                if (cancelled) return;
                setError(err.message);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    if (days === null) {
        return (
            <div className="hud">
                <div className="hud-eyebrow">Despair Approaching</div>
                <div className="hud-title">{error ? "Unknown" : "Loading..."}</div>
            </div>
        );
    }

    const moraleTier = getMoraleTier(days);
    const moraleImage = getMoraleImage(days);

    return (
        <div className="hud">
            <div className="hud-eyebrow">Despair Approaching</div>
            <div className="hud-title" style={{ color: moraleTier.color }}>{moraleTier.label}</div>

            <SquadMorale days={days} />
            <DaysSinceBar days={days} />
            <WarningIcon imageSrc={moraleImage} />
        </div>
    );
}
