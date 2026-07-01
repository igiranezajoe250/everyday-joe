/**
 * Build accurate per-paragraph cue points for the reader's audio↔reading sync.
 *
 * TTS gives no word timings, so we recover paragraph boundaries from the
 * narration itself: paragraphs are separated by "\n\n" in the prompt, which the
 * model renders as a distinctly longer pause than sentence breaks. For each
 * chapter MP3 we detect silences with ffmpeg, take the length-proportional
 * boundary as a prior, and snap it to the nearest genuine pause. Output is
 * public/audio/tbl-cues.json = { <chId>: [t0=0, t1, t2, …] } in seconds.
 *
 * Quota-free (local ffmpeg only). Run after generate-narration.mjs:
 *   node scripts/generate-cues.mjs         # write manifest
 *   node scripts/generate-cues.mjs --dry   # print, don't write
 */

import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";

import { CHAPTERS, AUDIO } from "../app/books/the-bottom-line/bookChapters.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "audio", "tbl-cues.json");
const DRY = process.argv.includes("--dry");

const SILENCE_DB = -33;      // noise floor for "silence"
const SILENCE_MIN = 0.45;    // minimum silence to register at all (seconds)
const PARA_PAUSE_MIN = 0.82; // a paragraph break pauses at least this long
const SNAP_WINDOW = 9;       // snap a boundary to a pause within ±this many seconds

const chapterById = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));

function ffprobeDuration(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { encoding: "utf8" });
  const d = parseFloat((r.stdout || "").trim());
  return Number.isFinite(d) ? d : 0;
}

/** All silences as { start, end, dur } via ffmpeg silencedetect. */
function detectSilences(file) {
  const r = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", file, "-af", `silencedetect=noise=${SILENCE_DB}dB:d=${SILENCE_MIN}`, "-f", "null", "-"],
    { encoding: "utf8" },
  );
  const out = `${r.stdout || ""}\n${r.stderr || ""}`;
  const sils = [];
  let start = null;
  for (const line of out.split(/\r?\n/)) {
    let m = line.match(/silence_start:\s*([\d.]+)/);
    if (m) { start = parseFloat(m[1]); continue; }
    m = line.match(/silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/);
    if (m && start != null) { sils.push({ start, end: parseFloat(m[1]), dur: parseFloat(m[2]) }); start = null; }
  }
  return sils;
}

/** Proportional prior boundaries (paragraph start fractions × duration). */
function proportionalStarts(body, dur) {
  const lens = body.map((p) => p.length);
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return lens.map((l) => { const t = (acc / total) * dur; acc += l; return t; });
}

/** Paragraph boundaries = the N-1 longest pauses, taken in time order, but
 *  only accepted when that reading is consistent with the length-proportional
 *  prior (each boundary within TOLERANCE of its prior). Paragraph breaks are
 *  reliably the longest silences; the prior guards against a stray dramatic
 *  mid-paragraph pause sneaking in. Falls back to the prior per-boundary. */
const TOLERANCE = 7; // a real boundary sits within this many seconds of its prior

function cuesForChapter(body, dur, silences) {
  const prior = proportionalStarts(body, dur);
  const K = body.length - 1; // interior boundaries
  if (K <= 0) return [0];

  // candidate boundaries: the K longest silences, in time order
  const longest = [...silences].sort((a, b) => b.dur - a.dur).slice(0, K).sort((a, b) => a.end - b.end);

  const cues = [0];
  const usable = longest.length === K &&
    longest.every((p, i) => Math.abs(p.end - prior[i + 1]) <= TOLERANCE);

  if (usable) {
    for (let i = 1; i < body.length; i++) cues.push(+longest[i - 1].end.toFixed(3));
    return cues;
  }

  // fallback: proportional prior, snapped to a nearby real pause when one is
  // clearly close (tight window + consumption so boundaries never collide)
  const pauses = silences.filter((s) => s.dur >= PARA_PAUSE_MIN).sort((a, b) => a.end - b.end);
  const used = new Set();
  for (let i = 1; i < body.length; i++) {
    const want = prior[i];
    let best = null, bestDist = Infinity;
    for (const p of pauses) {
      if (used.has(p) || p.end <= cues[i - 1] + 3) continue;
      const d = Math.abs(p.end - want);
      if (d < bestDist) { bestDist = d; best = p; }
    }
    let t = best && bestDist <= 4.5 ? (used.add(best), best.end) : Math.max(want, cues[i - 1] + 3);
    cues.push(+t.toFixed(3));
  }
  return cues;
}

const manifest = {};
let done = 0, skipped = 0;

for (const [id, meta] of Object.entries(AUDIO)) {
  const ch = chapterById[id];
  if (!ch || !ch.body?.length) { skipped++; continue; }
  const file = join(ROOT, "public", meta.src.replace(/^\//, ""));
  if (!existsSync(file)) { skipped++; continue; }
  const dur = ffprobeDuration(file);
  if (!dur) { console.warn(`! ${id}: no duration, skipped`); skipped++; continue; }
  const cues = cuesForChapter(ch.body, dur, detectSilences(file));
  manifest[id] = cues;
  done++;
  if (DRY) {
    const prior = proportionalStarts(ch.body, dur).map((t) => t.toFixed(1));
    console.log(`${id} (${ch.body.length}p, ${dur.toFixed(1)}s)`);
    console.log(`   prior: ${prior.join(", ")}`);
    console.log(`   cues:  ${cues.map((t) => t.toFixed(1)).join(", ")}`);
  }
}

if (DRY) {
  console.log(`\n[dry] ${done} chapters analyzed, ${skipped} skipped. Not written.`);
} else {
  // preserve any cues for chapters whose mp3 isn't present this run
  let prev = {};
  if (existsSync(OUT)) { try { prev = JSON.parse(readFileSync(OUT, "utf8")); } catch {} }
  const merged = { ...prev, ...manifest };
  writeFileSync(OUT, JSON.stringify(merged), "utf8");
  console.log(`Wrote ${OUT} — ${Object.keys(merged).length} chapters (${done} refreshed, ${skipped} skipped).`);
}
