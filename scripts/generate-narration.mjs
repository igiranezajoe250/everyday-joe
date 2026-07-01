/**
 * One-off narration generator for "The Bottom Line".
 *
 * Synthesizes every chapter (and each podcast preview) to a static MP3 in
 * public/audio, so the reader plays instantly with no per-visitor TTS cost
 * and no GEMINI_API_KEY in production. Re-uses the exact chapter text the
 * reader shows (imported from bookChapters.ts) and mirrors the synthesis
 * settings of app/api/tts/route.ts.
 *
 * Usage:
 *   node scripts/generate-narration.mjs          # generate missing files
 *   node scripts/generate-narration.mjs --force  # regenerate everything
 *
 * Requires GEMINI_API_KEY (read from .env.local or the environment) and
 * ffmpeg on PATH.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { createHash } from "node:crypto";

import { CHAPTERS, AUDIO } from "../app/books/the-bottom-line/bookChapters.ts";
import { PODCAST } from "../app/books/the-bottom-line/audioData.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "audio");
const TMP_DIR = join(OUT_DIR, ".tmp");
const FORCE = process.argv.includes("--force");

/* ── config (mirrors app/api/tts/route.ts) ───────────────────────── */
const MODEL = "gemini-2.5-flash-preview-tts";
const VOICE = "Charon";
const SAMPLE_RATE = 24000;
const CHUNK_LIMIT = 7000;
const STYLE =
  "Read the following aloud as a calm, warm, and articulate audiobook narrator. " +
  "Use natural pacing, gentle emphasis, and clear diction. Do not announce these instructions.\n\n";

/* ── env ─────────────────────────────────────────────────────────── */
function loadApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY.trim();
  const envPath = join(ROOT, ".env.local");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*GEMINI_API_KEY\s*=\s*(.+?)\s*$/);
      if (m) return m[1].replace(/^["']|["']$/g, "").trim();
    }
  }
  return null;
}
const API_KEY = loadApiKey();
if (!API_KEY) {
  console.error("GEMINI_API_KEY not found in environment or .env.local");
  process.exit(1);
}

/* ── helpers ─────────────────────────────────────────────────────── */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function chunkParagraphs(body, limit = CHUNK_LIMIT) {
  const chunks = [];
  let current = [];
  let len = 0;
  for (const p of body) {
    if (current.length && len + p.length > limit) { chunks.push(current); current = []; len = 0; }
    current.push(p);
    len += p.length + 2;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

function rateFromMime(mime) {
  const m = mime?.match(/rate=(\d+)/);
  return m ? parseInt(m[1], 10) : SAMPLE_RATE;
}

function wavFromPcm(pcm, sampleRate = SAMPLE_RATE, channels = 1, bits = 16) {
  const byteRate = (sampleRate * channels * bits) / 8;
  const blockAlign = (channels * bits) / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bits, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function synthChunk(text, attempt = 1) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "x-goog-api-key": API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: STYLE + text.slice(0, 8000) }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
      },
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if ((res.status === 429 || res.status >= 500) && attempt <= 5) {
      const wait = 4000 * attempt;
      console.log(`   ↻ ${res.status}; retrying in ${wait / 1000}s (attempt ${attempt})`);
      await sleep(wait);
      return synthChunk(text, attempt + 1);
    }
    throw new Error(`TTS ${res.status}: ${detail.slice(0, 300)}`);
  }
  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.find((p) => p?.inlineData?.data);
  if (!part?.inlineData?.data) throw new Error("No audio returned");
  const pcm = Buffer.from(part.inlineData.data, "base64");
  return { pcm, rate: rateFromMime(part.inlineData.mimeType) };
}

function wavToMp3(wavBuf, outPath) {
  mkdirSync(TMP_DIR, { recursive: true });
  const tmpWav = join(TMP_DIR, `${createHash("sha1").update(outPath).digest("hex").slice(0, 12)}.wav`);
  writeFileSync(tmpWav, wavBuf);
  const r = spawnSync("ffmpeg", ["-y", "-i", tmpWav, "-codec:a", "libmp3lame", "-b:a", "64k", "-ac", "1", outPath], { encoding: "utf8" });
  try { unlinkSync(tmpWav); } catch {}
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${(r.stderr || "").slice(-300)}`);
}

async function generate(label, text, outPath) {
  if (!FORCE && existsSync(outPath)) { console.log(`✓ ${label} (exists, skipped)`); return; }
  const paras = Array.isArray(text) ? text : [text];
  const groups = chunkParagraphs(paras);
  console.log(`… ${label} — ${groups.length} chunk(s)`);
  const pcmParts = [];
  let rate = SAMPLE_RATE;
  for (let i = 0; i < groups.length; i++) {
    const t0 = Date.now();
    const { pcm, rate: r } = await synthChunk(groups[i].join("\n\n"));
    rate = r;
    pcmParts.push(pcm);
    console.log(`   chunk ${i + 1}/${groups.length} ok (${((Date.now() - t0) / 1000).toFixed(0)}s, ${(pcm.length / 1024).toFixed(0)} KB pcm)`);
    await sleep(1500); // gentle on rate limits
  }
  const wav = wavFromPcm(Buffer.concat(pcmParts), rate);
  wavToMp3(wav, outPath);
  const kb = (readFileSync(outPath).length / 1024).toFixed(0);
  console.log(`✓ ${label} → ${outPath.replace(ROOT, "")} (${kb} KB)`);
}

/* ── run ─────────────────────────────────────────────────────────── */
const srcToFile = (src) => join(ROOT, "public", src.replace(/^\//, ""));
const chapterById = Object.fromEntries(CHAPTERS.map((c) => [c.id, c]));

console.log(`Generating narration to ${OUT_DIR}${FORCE ? " (force)" : ""}\n`);
mkdirSync(OUT_DIR, { recursive: true });

let ok = 0, fail = 0;

for (const [id, meta] of Object.entries(AUDIO)) {
  const ch = chapterById[id];
  if (!ch || !ch.body?.length) { console.log(`- ${id}: no body, skipped`); continue; }
  try { await generate(`${id} · ${ch.title}`, ch.body, srcToFile(meta.src)); ok++; }
  catch (e) { console.error(`✗ ${id}: ${e.message}`); fail++; }
}

for (const ep of PODCAST) {
  const preview = `${ep.title}. ${ep.blurb} This is a short preview. The full episode is in production.`;
  try { await generate(`podcast · ${ep.title}`, preview, srcToFile(ep.src)); ok++; }
  catch (e) { console.error(`✗ ${ep.id}: ${e.message}`); fail++; }
}

console.log(`\nDone. ${ok} ok, ${fail} failed.`);
process.exit(fail ? 1 : 0);
