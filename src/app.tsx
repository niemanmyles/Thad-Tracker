import { CallTracker } from "./components/CallTracker";

// Update this whenever Thad actually calls.
const LAST_CALL_DATE = new Date("2026-08-15");

export function App() {
    return (
        <div className="app">
            <h1>Thad Tracker</h1>
            <CallTracker getLastCallDate={() => LAST_CALL_DATE} />
        </div>
    );
}
