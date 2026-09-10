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

    // Retrieve last date seen from discord bot.
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const response = await fetch("/last-together", { method: 'GET', headers: { Accept: 'application/json' } });
                if (response.status === 503) {
                    throw new Error("not yet computed");
                }
                if (!response.ok) {
                    throw new Error(`request failed: ${response.status}`);
                }
                const data: LastTogetherResponse = await response.json();
                if (cancelled) return;
                setDays(daysSince(new Date(data.unixTimestamp * 1000)));
                setError(null);
            } catch (err) {
                if (cancelled) return;
                setError(err instanceof Error ? err.message : "Unknown error");
            }
        };

        load();

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
