import express from "express";
import type { Server } from "node:http";
import type { TogetherResult } from "./tracker.js";

export interface SharedState {
  result: TogetherResult | null;
  lastScanAt: number | null;
  lastError: string | null;
}

export function createServer(state: SharedState, port: number): Server {
  const app = express();

  app.get("/last-together", (_req, res) => {
    if (!state.result) {
      res.status(503).json({ error: "not yet computed" });
      return;
    }
    res.json({
      unixTimestamp: state.result.unixTimestamp,
      date: state.result.dayKey,
      lastScanAt: state.lastScanAt,
    });
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true, lastScanAt: state.lastScanAt, lastError: state.lastError });
  });

  return app.listen(port, () => {
    console.log(`HTTP server listening on port ${port}`);
  });
}
