import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Server } from "node:http";
import type { TogetherResult } from "./tracker.js";

// Built frontend output (see package.json "build"), served alongside the API.
const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const STATIC_DIR = path.join(MODULE_DIR, "..", "dist");

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

  app.use(express.static(STATIC_DIR));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(STATIC_DIR, "index.html"));
  });

  return app.listen(port, () => {
    console.log(`HTTP server listening on port ${port}`);
  });
}
