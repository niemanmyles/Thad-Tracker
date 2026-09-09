// Boss-approaching warning icon for Thad tracker.

export function WarningIcon() {
    return (
        <div className="hud-warning">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M12 3 L21 20 L3 20 Z" strokeLinejoin="round" />
                <line x1="12" y1="9" x2="12" y2="14" />
                <circle cx="12" cy="16.7" r="0.9" fill="currentColor" stroke="none" />
            </svg>
        </div>
    );
}
