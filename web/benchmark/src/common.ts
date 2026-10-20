import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

export const BENCH_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
export const WEB_DIR = join(BENCH_DIR, "..");
export const TEST_DATA_DIR = join(WEB_DIR, "..", "test-data");

export type Provider = "anthropic" | "openai" | "google";

/** Run-wide options from the command line (Gemini only): --detail, --thinking, --enhance. */
export const RUN_OPTIONS: { detail: string; thinking: string; enhance: boolean } = { detail: "default", thinking: "default", enhance: false };

export interface ModelConfig {
  provider: Provider;
  id: string;
  label: string;
  confirm?: boolean;
}

export interface ImageInput {
  label: string; // e.g. "Photo 1 of 6"
  mediaType: "image/jpeg" | "image/png";
  base64: string;
}

export interface CallResult {
  text: string;
  inputTokens?: number;
  outputTokens?: number;
  ms: number;
}

/** Load the API keys from web/.env.local, the same way the app does. Never logs values. */
export function loadEnv(): void {
  nextEnv.loadEnvConfig(WEB_DIR, false, { info: () => {}, error: console.error });
}

export function loadModels(): ModelConfig[] {
  return JSON.parse(readFileSync(join(BENCH_DIR, "models.json"), "utf8")).models;
}

/**
 * Remove EXIF (APP1) and IPTC (APP13) segments from a JPEG, which can carry GPS
 * location and device details (decision 006). Image data is left untouched.
 */
export function stripJpegMetadata(buf: Buffer): Buffer {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return buf;
  const parts: Buffer[] = [buf.subarray(0, 2)];
  let i = 2;
  while (i + 4 <= buf.length && buf[i] === 0xff) {
    const marker = buf[i + 1];
    if (marker === 0xda) break; // start of scan: the rest is image data
    const len = buf.readUInt16BE(i + 2);
    if (marker !== 0xe1 && marker !== 0xed) parts.push(buf.subarray(i, i + 2 + len));
    i += 2 + len;
  }
  parts.push(buf.subarray(i));
  return Buffer.concat(parts);
}

export function loadImage(path: string, label: string): ImageInput {
  const raw = readFileSync(path);
  const isPng = path.toLowerCase().endsWith(".png");
  const data = isPng ? raw : stripJpegMetadata(raw);
  return { label, mediaType: isPng ? "image/png" : "image/jpeg", base64: data.toString("base64") };
}

/** Pull the first JSON object out of a model's reply (tolerates code fences or stray text). */
export function parseJsonReply(text: string): any {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in reply");
  return JSON.parse(text.slice(start, end + 1));
}
