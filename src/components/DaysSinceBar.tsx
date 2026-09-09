// Track days-since-last-seen bar for Thad tracker.

interface DaysSinceBarProps {
    days: number;
}

const BAR_MAX_DAYS = 30;

export function DaysSinceBar({ days }: DaysSinceBarProps) {
    const barPercent = Math.min(100, (days / BAR_MAX_DAYS) * 100);

    return (
        <>
            <div className="hud-section-label">Days since last seen</div>
            <div className="hud-bar">
                <div className="hud-bar-fill" style={{ width: `${barPercent}%` }}>
                    <span className="hud-bar-value">{days}</span>
                </div>
            </div>
        </>
    );
}
