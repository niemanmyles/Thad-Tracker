// Boss-approaching warning box for Thad tracker.

interface WarningIconProps {
    imageSrc: string;
}

export function WarningIcon({ imageSrc }: WarningIconProps) {
    return (
        <div className="hud-warning">
            <img src={imageSrc} alt="Squad morale status" />
        </div>
    );
}
