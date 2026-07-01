"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import "./book.css";
import "./audio.css";
import {
  PODCAST, K, RATES, uid, fmtTime, loadJSON, saveJSON, buildShareCardSVG,
  BOOK_TITLE, BOOK_AUTHOR,
  type Note, type Highlight, type Bookmark, type DownloadState, type Progress,
} from "./audioData";

import {
  CHAPTERS, CONCEPTS, AUDIO,
} from "./bookChapters";

/* ── Screen model ────────────────────────────────────────────── */
type Screen =
  | { kind: "cover" }
  | { kind: "intro";    id: string }
  | { kind: "concept";  id: string }
  | { kind: "para";     id: string; text: string; idx: number; total: number }
  | { kind: "takeaway"; id: string }
  | { kind: "end" };

const SCREENS: Screen[] = (() => {
  const s: Screen[] = [{ kind: "cover" }];
  for (const ch of CHAPTERS) {
    if (ch.type !== "chapter") continue;
    s.push({ kind: "intro", id: ch.id });
    if (CONCEPTS[ch.id]) s.push({ kind: "concept", id: ch.id });
    ch.body.forEach((text, idx) =>
      s.push({ kind: "para", id: ch.id, text, idx, total: ch.body.length })
    );
    if (ch.pull) s.push({ kind: "takeaway", id: ch.id });
  }
  s.push({ kind: "end" });
  return s;
})();

const TOTAL = SCREENS.length;

/* ── Narration timing estimate ───────────────────────────────────
   No word-level timestamps are available from TTS, so each paragraph's
   start is estimated as its cumulative share of chapter text length.
   Good enough to keep reading and listening roughly aligned; not
   frame-accurate. */
function paragraphStartFractions(body: string[]): number[] {
  const lens = body.map(p => p.length);
  const total = lens.reduce((a, b) => a + b, 0) || 1;
  let acc = 0;
  return lens.map(l => { const f = acc / total; acc += l; return f; });
}

/* Split chapter paragraphs into ≤limit-char groups (never mid-paragraph)
   so long chapters can be synthesized as multiple TTS calls and stitched
   into one continuous track instead of being truncated. */
function chunkParagraphs(body: string[], limit = 7000): string[][] {
  const chunks: string[][] = [];
  let current: string[] = [];
  let len = 0;
  for (const p of body) {
    if (current.length && len + p.length > limit) {
      chunks.push(current);
      current = [];
      len = 0;
    }
    current.push(p);
    len += p.length + 2;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

/* Concatenate WAV blobs returned by /api/tts into one playable WAV
   (strip each 44-byte header, keep the first, recompute sizes). */
async function concatWavBlobs(blobs: Blob[]): Promise<Blob> {
  if (blobs.length === 1) return blobs[0];
  const buffers = await Promise.all(blobs.map(b => b.arrayBuffer()));
  const HEADER = 44;
  const pcmParts = buffers.map(buf => new Uint8Array(buf, HEADER));
  const totalPcmLen = pcmParts.reduce((n, p) => n + p.length, 0);
  const first = new DataView(buffers[0]);
  const sampleRate = first.getUint32(24, true);
  const channels = first.getUint16(22, true);
  const bitsPerSample = first.getUint16(34, true);
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = new ArrayBuffer(HEADER);
  const view = new DataView(header);
  const writeStr = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + totalPcmLen, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, "data");
  view.setUint32(40, totalPcmLen, true);
  return new Blob([header, ...pcmParts], { type: "audio/wav" });
}

/* ── Small shared pieces ─────────────────────────────────────── */
function DownloadPill({ state, onClick }: { state: DownloadState; onClick: () => void }) {
  if (state === "downloading")
    return <span className="au-dl"><span className="au-dl__ring" />Saving</span>;
  if (state === "done")
    return (
      <span className="au-dl is-done">
        <svg viewBox="0 0 16 16" fill="none"><path d="M3 8.5l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Saved offline
      </span>
    );
  return (
    <button className="au-dl" onClick={onClick}>
      <svg viewBox="0 0 16 16" fill="none"><path d="M8 2v8M8 10 5 7M8 10l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 13h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
      Download
    </button>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="au-empty">
      <div className="au-empty__mark">&ldquo;</div>
      <p className="au-empty__text">{label}</p>
    </div>
  );
}

/* ── Reader ──────────────────────────────────────────────────── */
export default function TheBottomLine() {
  const [si, setSi]         = useState(0);
  const [menuOpen, setMenu]   = useState(false);
  const [dark, setDark]       = useState(false);
  const [playing, setPlaying]     = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDur,  setAudioDur]  = useState(0);
  const [audioErr, setAudioErr]   = useState(false);
  const [rate, setRate]           = useState(1);
  /* on-demand narration (text-to-speech) */
  const [audioUrl, setAudioUrl]   = useState<string | null>(null);
  const [synth, setSynth]         = useState<"idle" | "loading" | "ready" | "error">("idle");

  /* listen experience */
  const [mode, setMode]           = useState<"read" | "listen">("read");
  const [listenTab, setListenTab] = useState<"listen" | "podcast">("listen");
  const [notes, setNotes]             = useState<Note[]>([]);
  const [highlights, setHighlights]   = useState<Highlight[]>([]);
  const [bookmarks, setBookmarks]     = useState<Bookmark[]>([]);
  const [progress, setProgress]       = useState<Record<string, Progress>>({});
  const [downloads, setDownloads]     = useState<Record<string, DownloadState>>({});
  const [libOpen, setLibOpen]         = useState(false);
  const [libTab, setLibTab]           = useState<"notes" | "highlights" | "bookmarks">("notes");
  const [composer, setComposer]       = useState<
    null | { kind: "note" | "highlight"; chId: string; t: number; text: string }
  >(null);
  const [shareTarget, setShareTarget] = useState<
    null | { text: string; chapterTitle: string | null }
  >(null);

  /* podcast preview playback (spoken preview of each episode blurb) */
  const [podPlaying, setPodPlaying] = useState<string | null>(null);
  const [podState, setPodState]     = useState<Record<string, "idle" | "loading" | "error">>({});

  /* per-paragraph narration cue points (absolute seconds), keyed by chapter.
     Measured from the audio itself (scripts/generate-cues.mjs). When absent
     for a chapter, sync falls back to a length-proportional estimate. */
  const [cues, setCues] = useState<Record<string, number[]>>({});

  const touchX        = useRef(0);
  const audioRef      = useRef<HTMLAudioElement>(null);
  const pendingSeek   = useRef<number | null>(null);
  const progressRef   = useRef<Record<string, Progress>>({});
  const audioTimeRef  = useRef(0);
  const audioDurRef   = useRef(0);
  const narrationCache = useRef<Map<string, string>>(new Map());
  const playAfterLoad  = useRef(false);
  const chIdRef        = useRef<string | null>(null);
  const syncFromAudio   = useRef(false);
  const synthInFlight   = useRef<Set<string>>(new Set());
  const podAudioRef     = useRef<HTMLAudioElement | null>(null);
  const podCache        = useRef<Map<string, string>>(new Map());

  const goNext = useCallback(() => setSi(i => Math.min(i + 1, TOTAL - 1)), []);
  const goPrev = useCallback(() => setSi(i => Math.max(i - 1, 0)), []);

  /* keyboard */
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goNext();
      if (e.key === "ArrowLeft"  || e.key === "ArrowUp")   goPrev();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev]);

  /* theme — saved preference, else system; applied pre-paint by the
     route layout script. This only syncs React state to what is already
     on <html>, so there is no flash. */
  useEffect(() => {
    let t = document.documentElement.getAttribute("data-theme");
    if (t !== "dark" && t !== "light") {
      try { t = localStorage.getItem("tbl-theme"); } catch { t = null; }
      if (t !== "dark" && t !== "light") {
        t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      document.documentElement.setAttribute("data-theme", t);
    }
    setDark(t === "dark");
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    const value = next ? "dark" : "light";
    /* Suppress transitions for the single frame of the switch so the
       theme applies instantly and cleanly (also sidesteps a Chromium
       repaint glitch with var()-driven transitions). Hover/interaction
       animations are untouched outside this frame. */
    const style = document.createElement("style");
    style.appendChild(
      document.createTextNode("*,*::before,*::after{transition:none !important}")
    );
    document.head.appendChild(style);
    document.documentElement.setAttribute("data-theme", value);
    try { localStorage.setItem("tbl-theme", value); } catch { /* ignore */ }
    window.getComputedStyle(document.body).opacity; // force reflow
    requestAnimationFrame(() => style.remove());
    setDark(next);
  };

  const screen    = SCREENS[si];
  const chId      = screen.kind !== "cover" && screen.kind !== "end" ? screen.id : null;
  const chapter   = chId ? CHAPTERS.find(c => c.id === chId) ?? null : null;
  const readProgress = si / (TOTAL - 1);

  const chapterList  = CHAPTERS.filter(c => c.type === "chapter");
  const chapterIdx   = chId ? chapterList.findIndex(c => c.id === chId) : -1;
  const nextChapter  = chapterIdx >= 0 ? chapterList[chapterIdx + 1] ?? null : null;
  const audioDefined = !!(chId && AUDIO[chId]);
  const audioReady   = audioDefined && !audioErr;
  const playedChapters = chapterList.filter(c => (progress[c.id]?.t ?? 0) > 5).length;

  const jumpTo = (id: string) => {
    const idx = SCREENS.findIndex(s => s.kind === "intro" && s.id === id);
    if (idx >= 0) setSi(idx);
    setMenu(false);
  };

  /* load the local-first library once */
  useEffect(() => {
    setNotes(loadJSON<Note[]>(K.notes, []));
    setHighlights(loadJSON<Highlight[]>(K.highlights, []));
    setBookmarks(loadJSON<Bookmark[]>(K.bookmarks, []));
    setDownloads(loadJSON<Record<string, DownloadState>>(K.downloads, {}));
    setRate(loadJSON<number>(K.rate, 1));
    const p = loadJSON<Record<string, Progress>>(K.progress, {});
    progressRef.current = p;
    setProgress(p);
  }, []);

  /* load narration cue points once (static, best-effort) */
  useEffect(() => {
    let alive = true;
    fetch("/audio/tbl-cues.json")
      .then(r => (r.ok ? r.json() : {}))
      .then(j => { if (alive && j && typeof j === "object") setCues(j as Record<string, number[]>); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  /* absolute per-paragraph start times for a chapter: exact measured cues
     when available, else a length-proportional estimate scaled to duration */
  const paraStartTimes = useCallback((id: string | null, dur: number): number[] => {
    const ch = id ? CHAPTERS.find(c => c.id === id) : null;
    if (!ch || !ch.body.length) return [];
    const measured = id ? cues[id] : undefined;
    if (measured && measured.length === ch.body.length) return measured;
    return paragraphStartFractions(ch.body).map(f => f * dur);
  }, [cues]);

  const commitProgress = useCallback((id: string, t: number, dur: number) => {
    const p = { ...progressRef.current, [id]: { t, dur, updatedAt: Date.now() } };
    progressRef.current = p;
    setProgress(p);
    saveJSON(K.progress, p);
  }, []);

  /* audio — reset transport when the chapter changes */
  useEffect(() => {
    const el = audioRef.current;
    if (el) { el.pause(); el.currentTime = 0; el.playbackRate = rate; }
    setPlaying(false);
    setAudioTime(0);
    setAudioDur(0);
    setAudioErr(false);
    audioTimeRef.current = 0;
    playAfterLoad.current = false;
    const cached = chId ? narrationCache.current.get(chId) : undefined;
    setAudioUrl(cached ?? null);
    setSynth(cached ? "ready" : "idle");
  }, [chId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { chIdRef.current = chId; }, [chId]);

  /* on-demand narration: synthesize via /api/tts when no static file
     exists for this chapter (audioErr fires once the static src 404s) */
  const synthesizeNarration = useCallback(async (id: string) => {
    const cached = narrationCache.current.get(id);
    if (cached) {
      setAudioUrl(cached);
      setAudioErr(false);
      setSynth("ready");
      return;
    }
    if (synthInFlight.current.has(id)) return;
    const ch = CHAPTERS.find(c => c.id === id);
    if (!ch || !ch.body.length) { if (chIdRef.current === id) setSynth("error"); return; }

    synthInFlight.current.add(id);
    if (chIdRef.current === id) setSynth("loading");
    try {
      const groups = chunkParagraphs(ch.body);
      const blobs: Blob[] = [];
      for (const group of groups) {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: group.join("\n\n") }),
        });
        if (!res.ok) throw new Error("tts failed");
        blobs.push(await res.blob());
      }
      const combined = await concatWavBlobs(blobs);
      const url = URL.createObjectURL(combined);
      narrationCache.current.set(id, url);
      if (chIdRef.current === id) {
        setAudioUrl(url);
        setAudioErr(false);
        setSynth("ready");
      }
    } catch {
      if (chIdRef.current === id) setSynth("error");
    } finally {
      synthInFlight.current.delete(id);
    }
  }, []);

  /* kick off synthesis once we know the static file is missing */
  useEffect(() => {
    if (audioErr && chId && synth === "idle") synthesizeNarration(chId);
  }, [audioErr, chId, synth, synthesizeNarration]);

  /* seek the track to the estimated start of whatever passage the reader
     is currently on (used when playback begins fresh, so listening starts
     where the eye already is rather than at 0:00) */
  const alignAudioToScreen = useCallback((dur: number) => {
    const scr = SCREENS[si];
    if (scr.kind !== "para" || scr.id !== chId || !dur) return;
    const target = paraStartTimes(chId, dur)[scr.idx] ?? 0;
    const el = audioRef.current;
    if (el && Math.abs(target - el.currentTime) > 2.5) {
      el.currentTime = target;
      setAudioTime(target);
      audioTimeRef.current = target;
    }
  }, [si, chId, paraStartTimes]);

  /* auto-play once narration finishes loading, if Play was pressed early */
  useEffect(() => {
    if (synth === "ready" && playAfterLoad.current) {
      playAfterLoad.current = false;
      const el = audioRef.current;
      if (!el) return;
      const start = () => {
        alignAudioToScreen(el.duration || audioDurRef.current);
        el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      };
      if (el.readyState >= 1 && el.duration) start();
      else el.addEventListener("loadedmetadata", start, { once: true });
    }
  }, [synth, audioUrl, alignAudioToScreen]);

  /* persist listening position when leaving a chapter */
  useEffect(() => {
    return () => {
      if (chId && audioTimeRef.current > 1) {
        commitProgress(chId, audioTimeRef.current, audioDurRef.current);
      }
    };
  }, [chId, commitProgress]);

  /* keep playback rate applied to the element */
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate, chId]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el || !chId) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      commitProgress(chId, el.currentTime, el.duration || audioDur);
    } else if (audioReady) {
      if (el.currentTime < 0.5) alignAudioToScreen(el.duration || audioDur);
      el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else if (synth !== "loading") {
      playAfterLoad.current = true;
      synthesizeNarration(chId);
    }
  };

  const skip = (s: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(audioDur || el.duration || 0, el.currentTime + s));
  };

  const seekTo = (t: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = t;
    setAudioTime(t);
    audioTimeRef.current = t;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioDur) return;
    const rect  = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seekTo(ratio * audioDur);
  };

  /* reading follows listening: while playing, advance the passage on
     screen to match the estimated narration position */
  useEffect(() => {
    if (!playing || !chId || !audioDur) return;
    const starts = paraStartTimes(chId, audioDur);
    if (!starts.length) return;
    let idealIdx = 0;
    for (let i = 0; i < starts.length; i++) if (audioTime + 0.15 >= starts[i]) idealIdx = i;
    const wantIdx = SCREENS.findIndex(s => s.kind === "para" && s.id === chId && s.idx === idealIdx);
    if (wantIdx < 0 || wantIdx === si) return;
    const cur = SCREENS[si];
    const onThisChapter =
      (cur.kind === "para" || cur.kind === "intro" || cur.kind === "concept") && cur.id === chId;
    if (onThisChapter) {
      syncFromAudio.current = true;
      setSi(wantIdx);
    }
  }, [audioTime, playing, chId, audioDur, paraStartTimes]); // eslint-disable-line react-hooks/exhaustive-deps

  /* listening follows reading: turning the page (tap/swipe/keys/drawer)
     seeks the audio to that passage's measured start */
  useEffect(() => {
    if (syncFromAudio.current) { syncFromAudio.current = false; return; }
    const scr = SCREENS[si];
    if (scr.kind !== "para" || scr.id !== chId || !audioDur) return;
    const target = paraStartTimes(chId, audioDur)[scr.idx] ?? 0;
    if (Math.abs(target - audioTimeRef.current) > 2.5) seekTo(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [si]);

  const cycleRate = () => {
    const idx  = RATES.indexOf(rate as (typeof RATES)[number]);
    const next = RATES[(idx + 1) % RATES.length];
    setRate(next);
    saveJSON(K.rate, next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  };

  /* podcast preview — synthesize and play a short spoken preview of the
     episode blurb (the full conversation isn't produced yet, so this is
     clearly framed as a preview, not the episode). */
  const togglePodcast = useCallback(async (ep: (typeof PODCAST)[number]) => {
    let el = podAudioRef.current;
    if (!el) { el = new Audio(); podAudioRef.current = el; }

    if (podPlaying === ep.id) {           // pause the currently-playing preview
      el.pause();
      setPodPlaying(null);
      return;
    }

    el.pause();                            // stop any other preview first
    if (audioRef.current && playing) { audioRef.current.pause(); setPlaying(false); }

    const start = (url: string) => {
      el!.src = url;
      el!.onended = () => setPodPlaying(null);
      el!.play().then(() => setPodPlaying(ep.id)).catch(() => setPodPlaying(null));
    };

    const cached = podCache.current.get(ep.id);
    if (cached) { start(cached); return; }

    setPodState(s => ({ ...s, [ep.id]: "loading" }));

    /* prefer the pre-generated static preview; fall back to on-demand TTS
       (dev, or if the static file isn't published yet) */
    try {
      const head = await fetch(ep.src, { method: "HEAD" });
      if (head.ok) {
        podCache.current.set(ep.id, ep.src);
        setPodState(s => ({ ...s, [ep.id]: "idle" }));
        start(ep.src);
        return;
      }
    } catch { /* fall through to synthesis */ }

    try {
      const preview = `${ep.title}. ${ep.blurb} This is a short preview. The full episode is in production.`;
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: preview }),
      });
      if (!res.ok) throw new Error("tts failed");
      const url = URL.createObjectURL(await res.blob());
      podCache.current.set(ep.id, url);
      setPodState(s => ({ ...s, [ep.id]: "idle" }));
      start(url);
    } catch {
      setPodState(s => ({ ...s, [ep.id]: "error" }));
    }
  }, [podPlaying, playing]);

  /* stop any podcast preview when leaving the podcast tab or the sheet */
  useEffect(() => {
    if (listenTab !== "podcast" || mode !== "listen") {
      podAudioRef.current?.pause();
      setPodPlaying(null);
    }
  }, [listenTab, mode]);

  /* library mutations — local-first, write-through to localStorage */
  const addNote = (text: string, t = audioTime) => {
    if (!chId || !text.trim()) return;
    const next: Note[] = [
      { id: uid(), chId, t, text: text.trim(), createdAt: Date.now() },
      ...notes,
    ];
    setNotes(next); saveJSON(K.notes, next);
  };
  const deleteNote = (id: string) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next); saveJSON(K.notes, next);
  };
  const addHighlight = (text: string, t = audioTime) => {
    if (!chId || !text.trim()) return;
    const next: Highlight[] = [
      { id: uid(), chId, t, text: text.trim(), createdAt: Date.now() },
      ...highlights,
    ];
    setHighlights(next); saveJSON(K.highlights, next);
  };
  const deleteHighlight = (id: string) => {
    const next = highlights.filter(h => h.id !== id);
    setHighlights(next); saveJSON(K.highlights, next);
  };
  const addBookmark = () => {
    if (!chId) return;
    const next: Bookmark[] = [
      { id: uid(), chId, t: audioTime, label: chapter?.title ?? "Bookmark", createdAt: Date.now() },
      ...bookmarks,
    ];
    setBookmarks(next); saveJSON(K.bookmarks, next);
  };
  const deleteBookmark = (id: string) => {
    const next = bookmarks.filter(b => b.id !== id);
    setBookmarks(next); saveJSON(K.bookmarks, next);
  };

  /* jump to a saved timestamp (seamless across chapters) */
  const jumpToStamp = (targetChId: string, t: number) => {
    setLibOpen(false);
    setMode("listen");
    if (targetChId === chId) {
      seekTo(t);
    } else {
      pendingSeek.current = t;
      const idx = SCREENS.findIndex(s => s.kind === "intro" && s.id === targetChId);
      if (idx >= 0) setSi(idx);
    }
  };

  /* real download with graceful fallback (caches the file when present) */
  const startDownload = async (id: string, src: string) => {
    setDownloads(prev => {
      const next = { ...prev, [id]: "downloading" as DownloadState };
      saveJSON(K.downloads, next); return next;
    });
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error("unavailable");
      if ("caches" in window) {
        const cache = await caches.open("tbl-audio");
        await cache.put(src, res.clone());
      }
      setDownloads(prev => {
        const next = { ...prev, [id]: "done" as DownloadState };
        saveJSON(K.downloads, next); return next;
      });
    } catch {
      /* file not yet published — revert so it can be retried later */
      setDownloads(prev => {
        const next = { ...prev, [id]: "idle" as DownloadState };
        saveJSON(K.downloads, next); return next;
      });
    }
  };

  /* export a branded share card as PNG (user-initiated) */
  const downloadShareCard = (svg: string) => {
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url  = URL.createObjectURL(blob);
    const img  = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1080; canvas.height = 1350;
      const ctx = canvas.getContext("2d");
      if (ctx) { ctx.drawImage(img, 0, 0); }
      URL.revokeObjectURL(url);
      canvas.toBlob(b => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = "the-bottom-line-quote.png";
        a.click();
        URL.revokeObjectURL(a.href);
      }, "image/png");
    };
    img.src = url;
  };

  /* helpers */
  const isStory    = (t: string) => /^—\s.+\s—$/.test(t.trim());
  const isElevated = (t: string) => t.length <= 115 && !t.endsWith(":") && !t.endsWith(",");

  return (
    <div
      className="bl-reader"
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 55) dx < 0 ? goNext() : goPrev();
      }}
    >
      {/* ── Topbar ── */}
      <div className="bl-topbar">
        <Link href="/books" className="bl-topbar__back">← Books</Link>
        <div className="bl-topbar__center">
          <span className="bl-topbar__label">
            {chapter?.num ? `${chapter.num} · ${chapter.title}` : "The Bottom Line"}
          </span>
        </div>
        <div className="bl-topbar__right">
          {chId && (
            <div className="au-seg" role="tablist" aria-label="Read or listen">
              <button
                className={`au-seg__btn${mode === "read" ? " is-active" : ""}`}
                onClick={() => setMode("read")}
                role="tab"
                aria-selected={mode === "read"}
              >Read</button>
              <button
                className={`au-seg__btn${mode === "listen" ? " is-active" : ""}`}
                onClick={() => setMode("listen")}
                role="tab"
                aria-selected={mode === "listen"}
              >Listen</button>
            </div>
          )}
          <button
            className="bl-topbar__dark"
            onClick={toggleTheme}
            aria-label={dark ? "Light mode" : "Dark mode"}
          />
          <button
            className={`bl-menu-icon${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenu(v => !v)}
            aria-label={menuOpen ? "Close contents" : "Open contents"}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="bl-progress">
        <div className="bl-progress__fill" style={{ width: `${readProgress * 100}%` }} />
      </div>

      {/* ── Contents overlay ── */}
      {menuOpen && (
        <div className="bl-drawer" onClick={() => setMenu(false)}>
          {/* Close button */}
          <button
            className="bl-drawer__close"
            onClick={() => setMenu(false)}
            aria-label="Close contents"
          >
            <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 2L18 18M18 2L2 18" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="bl-drawer__panel" onClick={e => e.stopPropagation()}>
            <p className="bl-drawer__head">CONTENTS</p>
            <div className="bl-drawer__list">
              {CHAPTERS.filter(c => c.type === "chapter").map((c, i) => (
                <button
                  key={c.id}
                  className={`bl-drawer__item${c.id === chId ? " is-active" : ""}`}
                  onClick={() => jumpTo(c.id)}
                  style={{ animationDelay: `${i * 22}ms` }}
                >
                  <span className="bl-drawer__num">{c.num ?? "·"}</span>
                  <span className="bl-drawer__title">{c.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Passage area ── */}
      <div className="bl-stage">
        {/* Tap zones */}
        <button className="bl-tap bl-tap--prev" onClick={goPrev} aria-label="Previous passage" tabIndex={-1} />
        <button className="bl-tap bl-tap--next" onClick={goNext} aria-label="Next passage"     tabIndex={-1} />

        {/* Passage — key={si} triggers re-animation each change */}
        <div key={si} className="bl-passage">

          {/* COVER */}
          {screen.kind === "cover" && (
            <div className="bl-cover">
              <div className="bl-cover__text">
                <p className="bl-cov__label">INGOGA LABS PRESENTS</p>
                <h1 className="bl-cov__title">THE BOTTOM LINE</h1>
                <p className="bl-cov__sub">Building Trusted Systems</p>
                <div className="bl-cov__source">
                  <span>THE AUTHOR</span>
                  <strong>Sheja Vallière</strong>
                  <p>Author and strategist writing on trust, evidence, and the systems that make progress durable.</p>
                </div>
                <button className="bl-cov__btn" onClick={goNext}>
                  <span className="bl-cov__btn-icon" aria-hidden="true">
                    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 2.5L13.5 8 4 13.5V2.5Z" />
                    </svg>
                  </span>
                  BEGIN READING
                </button>
              </div>
              <div className="bl-cover__art">
                <img
                  src="/images/books/sheja-valliere-plate-v2.png"
                  alt="Portrait of Sheja Vallière"
                />
              </div>
            </div>
          )}

          {/* CHAPTER INTRO */}
          {screen.kind === "intro" && chapter && (
            <div className="bl-col">
              {chapter.part && <p className="bl-intro__part">{chapter.part}</p>}
              {chapter.num  && <span className="bl-intro__num">{chapter.num}</span>}
              <h2 className="bl-intro__title">{chapter.title}</h2>
              {chapter.subtitle && <p className="bl-intro__sub">{chapter.subtitle}</p>}
            </div>
          )}

          {/* CONCEPT — open typography, no card */}
          {screen.kind === "concept" && chapter && CONCEPTS[chapter.id] && (
            <div className="bl-col">
              <p className="bl-concept__label">CONCEPT INTRODUCED</p>
              <p className="bl-concept__name">{CONCEPTS[chapter.id].name}</p>
              <p className="bl-concept__def">{CONCEPTS[chapter.id].definition}</p>
            </div>
          )}

          {/* PARAGRAPH */}
          {screen.kind === "para" && (() => {
            const { text, idx, total } = screen;
            const story    = isStory(text);
            const elevated = !story && isElevated(text);
            const center   = story || elevated;
            return (
              <div className={`bl-col${center ? " bl-col--center" : ""}`}>
                {story    && <p className="bl-para--story">{text}</p>}
                {elevated && <p className="bl-para--big">{text}</p>}
                {!story && !elevated && <p className="bl-para">{text}</p>}
                <span className="bl-para__pos">{idx + 1} / {total}</span>
              </div>
            );
          })()}

          {/* KEY TAKEAWAY — open quotes, no box */}
          {screen.kind === "takeaway" && chapter?.pull && (
            <div className="bl-col bl-col--center">
              <p className="bl-take__label">KEY TAKEAWAY</p>
              <div className="bl-take__wrap">
                <span className="bl-take__mark" aria-hidden="true">"</span>
                <p className="bl-take__text">{chapter.pull}</p>
                <span className="bl-take__mark bl-take__mark--close" aria-hidden="true">"</span>
              </div>
            </div>
          )}

          {/* END */}
          {screen.kind === "end" && (
            <div className="bl-col bl-col--center">
              <p className="bl-end__label">THE END</p>
              <p className="bl-end__line">The line you draw<br />is the system you become.</p>
              <p className="bl-end__author">— Sheja Vallière</p>
              <div className="bl-end__links">
                <Link href="/books" className="bl-end__link">← Return to Books</Link>
                <Link href="/"      className="bl-end__link">Ingoga Labs ↗</Link>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Audio: persistent element + compact docked player ── */}
      {audioDefined && chId && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl ?? AUDIO[chId].src}
            preload="metadata"
            onTimeUpdate={e => { const t = e.currentTarget.currentTime; setAudioTime(t); audioTimeRef.current = t; }}
            onLoadedMetadata={e => {
              const d = e.currentTarget.duration;
              setAudioDur(d); audioDurRef.current = d;
              e.currentTarget.playbackRate = rate;
              if (pendingSeek.current != null) {
                e.currentTarget.currentTime = pendingSeek.current;
                setAudioTime(pendingSeek.current);
                pendingSeek.current = null;
              }
            }}
            onDurationChange={e => { const d = e.currentTarget.duration; setAudioDur(d); audioDurRef.current = d; }}
            onEnded={() => {
              setPlaying(false);
              if (chId) commitProgress(chId, audioDurRef.current, audioDurRef.current);
              const takeawayIdx = SCREENS.findIndex(s => s.kind === "takeaway" && s.id === chId);
              if (takeawayIdx >= 0 && takeawayIdx !== si) setSi(takeawayIdx);
            }}
            onError={() => { if (!audioUrl) setAudioErr(true); }}
          />

          <div className="au-mini">
            <div className="au-mini__thread">
              <div className="au-mini__thread-fill" style={{ width: `${audioDur ? (audioTime / audioDur) * 100 : 0}%` }} />
            </div>
            <button className="au-mini__play" onClick={togglePlay} disabled={!audioReady} aria-label={playing ? "Pause" : "Play"}>
              {playing
                ? <svg viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" /></svg>
                : <svg viewBox="0 0 16 16"><path d="M3 2L13 8 3 14V2Z" /></svg>}
            </button>
            <div
              className="au-mini__meta"
              role="button"
              tabIndex={0}
              onClick={() => setMode("listen")}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setMode("listen"); } }}
            >
              <span className="au-mini__title">{chapter?.title ?? BOOK_TITLE}</span>
              <span className="au-mini__sub">
                <span>{audioUrl ? "AI NARRATION" : AUDIO[chId].label}</span>
                <span className="au-mini__dot">·</span>
                <span className="au-mini__time">
                  {audioReady
                    ? `${fmtTime(audioTime)} / ${fmtTime(audioDur)}`
                    : synth === "loading" ? "Generating narration…"
                    : synth === "error"   ? "Narration unavailable"
                    : "Loading narration…"}
                </span>
              </span>
            </div>
            <div className="au-mini__actions">
              <button className="au-iconbtn" onClick={() => setComposer({ kind: "note", chId, t: audioTime, text: "" })} aria-label="Add note">
                <svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><line x1="5" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><line x1="5" y1="10.5" x2="8.5" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
              </button>
              <button className="au-iconbtn" onClick={addBookmark} aria-label="Bookmark this moment">
                <svg viewBox="0 0 16 16" fill="none"><path d="M4 2.5h8v11l-4-2.6-4 2.6v-11Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
              </button>
              <button className="au-iconbtn au-iconbtn--expand" onClick={() => setMode("listen")} aria-label="Open player">
                <svg viewBox="0 0 18 18" fill="none"><path d="M5 11l4-4 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Bottom navigation ── */}
      <div className="bl-nav">
        <button
          className="bl-nav__btn"
          onClick={goPrev}
          disabled={si === 0}
          aria-label="Previous"
        >←</button>

        <div className="bl-nav__info">
          {chapter?.num && (
            <span className="bl-nav__chapter">{chapter.num} · {chapter.title}</span>
          )}
          <span className="bl-nav__pos">{si + 1} / {TOTAL}</span>
        </div>

        <button
          className="bl-nav__btn"
          onClick={goNext}
          disabled={si === TOTAL - 1}
          aria-label="Next"
        >→</button>
      </div>

      {/* ── Listen sheet (expanded now-playing) ── */}
      {mode === "listen" && chId && (
        <div className="au-sheet" role="dialog" aria-label="Audio player">
          <div className="au-sheet__bar">
            <button className="au-iconbtn au-iconbtn--expand" onClick={() => setMode("read")} aria-label="Back to reading">
              <svg viewBox="0 0 18 18" fill="none"><path d="M5 7l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <div className="au-sheet__tabs" role="tablist">
              <button className={`au-tab${listenTab === "listen" ? " is-active" : ""}`} onClick={() => setListenTab("listen")} role="tab" aria-selected={listenTab === "listen"}>Listen</button>
              <button className={`au-tab${listenTab === "podcast" ? " is-active" : ""}`} onClick={() => setListenTab("podcast")} role="tab" aria-selected={listenTab === "podcast"}>Podcast</button>
            </div>
            <div className="au-sheet__actions">
              <button className="au-iconbtn" onClick={() => setMenu(true)} aria-label="Open table of contents">
                <svg viewBox="0 0 16 16" fill="none">
                  <line x1="5.5" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="5.5" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <line x1="5.5" y1="12" x2="13" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <circle cx="2.5" cy="4" r=".8" fill="currentColor" />
                  <circle cx="2.5" cy="8" r=".8" fill="currentColor" />
                  <circle cx="2.5" cy="12" r=".8" fill="currentColor" />
                </svg>
              </button>
              <button className="au-iconbtn" onClick={() => { setLibTab("notes"); setLibOpen(true); }} aria-label="Open library">
                <svg viewBox="0 0 16 16" fill="none"><path d="M3 2.5h3v11l-1.5-1-1.5 1v-11Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /><path d="M7.5 2.5H13v11H7.5" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /><line x1="9" y1="6" x2="11.5" y2="6" stroke="currentColor" strokeWidth="1" /><line x1="9" y1="8.5" x2="11.5" y2="8.5" stroke="currentColor" strokeWidth="1" /></svg>
              </button>
            </div>
          </div>

          <div className="au-sheet__body">
            {listenTab === "listen" ? (
              <>
                <div className="au-now">
                  <div
                    className="au-now__art"
                    style={{ backgroundImage: "url(/images/books/the-bottom-line/trust-built-v2.png)" }}
                    aria-hidden="true"
                  >
                    <span className="au-now__art-mark">{chapter?.num ?? "·"}</span>
                  </div>
                  <p className="au-now__part">{chapter?.part ?? BOOK_TITLE}</p>
                  <h2 className="au-now__title">{chapter?.title}</h2>
                  {chapter?.subtitle && <p className="au-now__sub">{chapter.subtitle}</p>}
                  {audioUrl && <p className="au-now__unavailable">AI-generated narration</p>}
                  <div className="au-now__dl">
                    {audioReady && !audioUrl && (
                      <DownloadPill state={downloads[chId] ?? "idle"} onClick={() => startDownload(chId, AUDIO[chId].src)} />
                    )}
                    {audioReady && audioUrl && (
                      <span className="au-now__unavailable">Generated for this session</span>
                    )}
                    {!audioReady && synth === "loading" && (
                      <span className="au-dl"><span className="au-dl__ring" />Generating narration</span>
                    )}
                    {!audioReady && synth === "error" && (
                      <button className="au-dl" onClick={() => chId && synthesizeNarration(chId)}>Retry narration</button>
                    )}
                    {!audioReady && synth === "idle" && (
                      <span className="au-now__unavailable">Narration coming soon</span>
                    )}
                  </div>
                </div>

                <div className="au-transport">
                  <div className="au-scrub__bar" onClick={handleSeek}>
                    <div className="au-scrub__fill" style={{ width: `${audioDur ? (audioTime / audioDur) * 100 : 0}%` }} />
                    <div className="au-scrub__thumb" style={{ left: `${audioDur ? (audioTime / audioDur) * 100 : 0}%` }} />
                    <div className="au-scrub__marks">
                      {audioDur > 0 && bookmarks.filter(b => b.chId === chId).map(b => (
                        <span key={b.id} className="au-scrub__mark" style={{ left: `${(b.t / audioDur) * 100}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="au-scrub__time">
                    <span>{fmtTime(audioTime)}</span>
                    <span>-{fmtTime(Math.max(0, audioDur - audioTime))}</span>
                  </div>

                  <div className="au-controls">
                    <button className="au-ctrl au-ctrl--chev" disabled={chapterIdx <= 0} aria-label="Previous chapter"
                      onClick={() => { const p = chapterList[chapterIdx - 1]; const idx = SCREENS.findIndex(s => s.kind === "intro" && s.id === p?.id); if (idx >= 0) setSi(idx); }}>
                      <svg viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <button className="au-ctrl" onClick={() => skip(-15)} disabled={!audioReady} aria-label="Back 15 seconds">
                      <svg viewBox="0 0 24 24" fill="none"><path d="M12 5a7 7 0 1 0 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M12 5 8.5 8 12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className="au-ctrl__skip-label">15</span>
                    </button>
                    <button className="au-ctrl au-ctrl--play" onClick={togglePlay} disabled={!audioReady} aria-label={playing ? "Pause" : "Play"}>
                      {playing
                        ? <svg viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" /></svg>
                        : <svg viewBox="0 0 16 16"><path d="M3 2L13 8 3 14V2Z" /></svg>}
                    </button>
                    <button className="au-ctrl" onClick={() => skip(15)} disabled={!audioReady} aria-label="Forward 15 seconds">
                      <svg viewBox="0 0 24 24" fill="none"><path d="M12 5a7 7 0 1 1-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M12 5l3.5 3L12 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      <span className="au-ctrl__skip-label">15</span>
                    </button>
                    <button className="au-ctrl au-ctrl--chev" disabled={!nextChapter} aria-label="Next chapter"
                      onClick={() => { if (nextChapter) { const idx = SCREENS.findIndex(s => s.kind === "intro" && s.id === nextChapter.id); if (idx >= 0) setSi(idx); } }}>
                      <svg viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  </div>

                  <div className="au-subrow">
                    <button className="au-speed" onClick={cycleRate} aria-label="Playback speed">{rate}&times;</button>
                    <div className="au-subrow__group">
                      <button className="au-iconbtn" onClick={addBookmark} aria-label="Bookmark">
                        <svg viewBox="0 0 16 16" fill="none"><path d="M4 2.5h8v11l-4-2.6-4 2.6v-11Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                      </button>
                      <button className="au-iconbtn" onClick={() => setComposer({ kind: "note", chId, t: audioTime, text: "" })} aria-label="Add note">
                        <svg viewBox="0 0 16 16" fill="none"><rect x="2.5" y="1.5" width="11" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><line x1="5" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><line x1="5" y1="10.5" x2="8.5" y2="10.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>
                      </button>
                      <button className="au-iconbtn" onClick={() => setComposer({ kind: "highlight", chId, t: audioTime, text: chapter?.pull ?? "" })} aria-label="Add highlight">
                        <svg viewBox="0 0 16 16" fill="none"><path d="M3 4h7M3 7h10M3 10h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                      </button>
                      <button className="au-iconbtn" onClick={() => setShareTarget({ text: chapter?.pull ?? chapter?.title ?? BOOK_TITLE, chapterTitle: chapter?.title ?? null })} aria-label="Share">
                        <svg viewBox="0 0 16 16" fill="none"><path d="M8 10V2M8 2 5.5 4.5M8 2l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.5 8v5h9V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="au-queue">
                  <p className="au-queue__label">Next in queue</p>
                  {nextChapter ? (
                    <button className="au-queue__item" onClick={() => { const idx = SCREENS.findIndex(s => s.kind === "intro" && s.id === nextChapter.id); if (idx >= 0) setSi(idx); }}>
                      <span className="au-queue__num">{nextChapter.num}</span>
                      <span className="au-queue__title">{nextChapter.title}</span>
                      <span className="au-queue__meta">Chapter</span>
                    </button>
                  ) : (
                    <button className="au-queue__item" onClick={() => setListenTab("podcast")}>
                      <span className="au-queue__num">&#9834;</span>
                      <span className="au-queue__title">{PODCAST[0].title}</span>
                      <span className="au-queue__meta">Podcast</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="au-pod">
                <p className="au-pod__intro">Conversations, author insight and related listening around {BOOK_TITLE}.</p>
                {PODCAST.map(ep => {
                  const isPlaying = podPlaying === ep.id;
                  const isLoading = podState[ep.id] === "loading";
                  const isError   = podState[ep.id] === "error";
                  return (
                  <div className="au-pod__item" key={ep.id}>
                    <div className="au-pod__art">
                      <img src={ep.image} alt="" />
                      <button
                        className={`au-pod__play${isPlaying ? " is-playing" : ""}`}
                        onClick={() => togglePodcast(ep)}
                        disabled={isLoading}
                        aria-label={isPlaying ? `Pause ${ep.title} preview` : `Play ${ep.title} preview`}
                      >
                        {isLoading
                          ? <span className="au-dl__ring" />
                          : isPlaying
                            ? <svg viewBox="0 0 16 16"><rect x="3" y="2" width="3.5" height="12" rx="1" /><rect x="9.5" y="2" width="3.5" height="12" rx="1" /></svg>
                            : <svg viewBox="0 0 16 16"><path d="M3 2L13 8 3 14V2Z" /></svg>}
                      </button>
                    </div>
                    <div className="au-pod__body">
                      <p className="au-pod__kind">{ep.kind}</p>
                      <h3 className="au-pod__title">{ep.title}</h3>
                      <p className="au-pod__blurb">{ep.blurb}</p>
                      <div className="au-pod__foot">
                        {ep.guest && <span className="au-pod__guest">{ep.guest}</span>}
                        <span>{ep.duration}</span>
                        <span className="au-pod__status">
                          {isError ? "Preview unavailable" : isPlaying ? "Playing preview" : isLoading ? "Generating…" : "Preview"}
                        </span>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Library ── */}
      {libOpen && (
        <div className="au-scrim" onClick={() => setLibOpen(false)}>
          <div className="au-panel" onClick={e => e.stopPropagation()}>
            <div className="au-panel__head">
              <span className="au-panel__title">Library</span>
              <button className="au-iconbtn" onClick={() => setLibOpen(false)} aria-label="Close library">
                <svg viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div className="au-libtabs">
              <button className={`au-libtab${libTab === "notes" ? " is-active" : ""}`} onClick={() => setLibTab("notes")}>Notes<span className="au-libtab__count">{notes.length}</span></button>
              <button className={`au-libtab${libTab === "highlights" ? " is-active" : ""}`} onClick={() => setLibTab("highlights")}>Highlights<span className="au-libtab__count">{highlights.length}</span></button>
              <button className={`au-libtab${libTab === "bookmarks" ? " is-active" : ""}`} onClick={() => setLibTab("bookmarks")}>Bookmarks<span className="au-libtab__count">{bookmarks.length}</span></button>
            </div>
            <div className="au-panel__body">
              <div className="au-prog">
                <p className="au-prog__label">Listening progress · synced to this device</p>
                <div className="au-prog__row">
                  <span className="au-prog__pct">{Math.round((playedChapters / chapterList.length) * 100)}%</span>
                  <span className="au-prog__meta">{playedChapters} / {chapterList.length} chapters</span>
                </div>
                <div className="au-prog__track"><div className="au-prog__fill" style={{ width: `${(playedChapters / chapterList.length) * 100}%` }} /></div>
              </div>

              {libTab === "notes" && (notes.length ? notes.map(n => {
                const c = CHAPTERS.find(x => x.id === n.chId);
                return (
                  <div className="au-item" key={n.id}>
                    <div className="au-item__top">
                      <button className="au-item__stamp" onClick={() => jumpToStamp(n.chId, n.t)}><svg viewBox="0 0 16 16"><path d="M3 2L13 8 3 14V2Z" /></svg>{fmtTime(n.t)}</button>
                      <span className="au-item__chapter">{c?.num ? `${c.num} · ${c.title}` : c?.title}</span>
                    </div>
                    <p className="au-item__text">{n.text}</p>
                    <div className="au-item__row">
                      <button className="au-item__action" onClick={() => setShareTarget({ text: n.text, chapterTitle: c?.title ?? null })}>Share</button>
                      <button className="au-item__action" onClick={() => deleteNote(n.id)}>Delete</button>
                    </div>
                  </div>
                );
              }) : <Empty label="No notes yet. Tap the note icon while listening to capture a thought at the exact moment." />)}

              {libTab === "highlights" && (highlights.length ? highlights.map(h => {
                const c = CHAPTERS.find(x => x.id === h.chId);
                return (
                  <div className="au-item au-item--highlight" key={h.id}>
                    <div className="au-item__top">
                      <button className="au-item__stamp" onClick={() => jumpToStamp(h.chId, h.t)}><svg viewBox="0 0 16 16"><path d="M3 2L13 8 3 14V2Z" /></svg>{fmtTime(h.t)}</button>
                      <span className="au-item__chapter">{c?.title}</span>
                    </div>
                    <p className="au-item__text">{h.text}</p>
                    <div className="au-item__row">
                      <button className="au-item__action" onClick={() => setShareTarget({ text: h.text, chapterTitle: c?.title ?? null })}>Share</button>
                      <button className="au-item__action" onClick={() => deleteHighlight(h.id)}>Delete</button>
                    </div>
                  </div>
                );
              }) : <Empty label="No highlights yet. Save a line that matters and it lives here." />)}

              {libTab === "bookmarks" && (bookmarks.length ? bookmarks.map(b => {
                const c = CHAPTERS.find(x => x.id === b.chId);
                return (
                  <div className="au-item" key={b.id}>
                    <div className="au-item__top">
                      <button className="au-item__stamp" onClick={() => jumpToStamp(b.chId, b.t)}><svg viewBox="0 0 16 16"><path d="M3 2L13 8 3 14V2Z" /></svg>{fmtTime(b.t)}</button>
                      <span className="au-item__chapter">{c?.num ? `${c.num} · ${c.title}` : c?.title}</span>
                    </div>
                    <div className="au-item__row">
                      <button className="au-item__action" onClick={() => deleteBookmark(b.id)}>Remove</button>
                    </div>
                  </div>
                );
              }) : <Empty label="No bookmarks yet. Mark a moment to return to it instantly." />)}
            </div>
          </div>
        </div>
      )}

      {/* ── Note / highlight composer ── */}
      {composer && (
        <div className="au-note-window-layer">
          <div
            className="au-compose"
            role="dialog"
            aria-modal="false"
            aria-label={composer.kind === "note" ? "Add a note" : "Add a highlight"}
          >
            <div className="au-compose__head">
              <span className="au-compose__stamp">{composer.kind === "note" ? "Note at" : "Highlight at"} <b>{fmtTime(composer.t)}</b></span>
              <button className="au-iconbtn" onClick={() => setComposer(null)} aria-label="Close">
                <svg viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
              </button>
            </div>
            <textarea
              className="au-compose__area"
              autoFocus
              placeholder={composer.kind === "note" ? "Capture a thought…" : "The line worth keeping…"}
              value={composer.text}
              onChange={e => setComposer({ ...composer, text: e.target.value })}
            />
            <div className="au-compose__foot">
              <button className="au-btn au-btn--primary" disabled={!composer.text.trim()}
                onClick={() => {
                  if (composer.kind === "note") addNote(composer.text, composer.t);
                  else addHighlight(composer.text, composer.t);
                  setComposer(null);
                }}>
                Save {composer.kind === "note" ? "note" : "highlight"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Share card ── */}
      {shareTarget && (() => {
        const svg = buildShareCardSVG({ quote: shareTarget.text, chapterTitle: shareTarget.chapterTitle, dark });
        return (
          <div className="au-scrim au-scrim--center" onClick={() => setShareTarget(null)}>
            <div className="au-share" onClick={e => e.stopPropagation()}>
              <div className="au-share__head">
                <span className="au-compose__stamp">Share card</span>
                <button className="au-iconbtn" onClick={() => setShareTarget(null)} aria-label="Close">
                  <svg viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
                </button>
              </div>
              <div className="au-share__preview" dangerouslySetInnerHTML={{ __html: svg }} />
              <div className="au-share__foot">
                <button className="au-btn" onClick={async () => { try { await navigator.clipboard.writeText(`"${shareTarget.text}"\n— ${BOOK_TITLE}, ${BOOK_AUTHOR}`); } catch { /* ignore */ } }}>Copy quote</button>
                <button className="au-btn au-btn--primary" onClick={() => downloadShareCard(svg)}>Download card</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
