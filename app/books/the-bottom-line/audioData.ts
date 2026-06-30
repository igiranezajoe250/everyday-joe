/* ── Audio Reading — data, persistence & share-card helpers ──────────
   All state is local-first (localStorage), keyed per book. No colours or
   layout here — only data the Listen experience reads and writes. */

export const BOOK_ID = "tbl";
export const BOOK_TITLE = "The Bottom Line";
export const BOOK_AUTHOR = "Sheja Vallière";

export type DownloadState = "idle" | "queued" | "downloading" | "done";

export type Note = {
  id: string;
  chId: string;
  t: number;          // audio position in seconds
  text: string;
  createdAt: number;
};

export type Highlight = {
  id: string;
  chId: string;
  t: number;
  text: string;
  createdAt: number;
};

export type Bookmark = {
  id: string;
  chId: string;
  t: number;
  label: string;
  createdAt: number;
};

export type Progress = { t: number; dur: number; updatedAt: number };

export type PodcastEpisode = {
  id: string;
  kind: "discussion" | "insight" | "interview" | "related";
  title: string;
  blurb: string;
  image: string;
  guest?: string;
  duration: string;   // display only
  src: string;
};

/* ── Podcast companion content (connected to the book) ───────────── */
export const PODCAST: PodcastEpisode[] = [
  {
    id: "pod-intro",
    image: "/images/books/the-bottom-line/trust-built-v2.png",
    kind: "discussion",
    title: "Why trust is built, not claimed",
    blurb: "An opening conversation on the central idea of the book — the floor, the signal, and how systems become legible.",
    guest: "with the editors",
    duration: "22 min",
    src: "/audio/pod-intro.mp3",
  },
  {
    id: "pod-author",
    image: "/images/books/the-bottom-line/authors-note-v2.png",
    kind: "insight",
    title: "Author's note: writing The Bottom Line",
    blurb: "Sheja Vallière on the questions that started the book and the cases that shaped it.",
    guest: "Sheja Vallière",
    duration: "16 min",
    src: "/audio/pod-author.mp3",
  },
  {
    id: "pod-rwanda",
    image: "/images/books/the-bottom-line/rwanda-reliability-v2.png",
    kind: "interview",
    title: "Rwanda, reliability, and rebuilding trust",
    blurb: "A field conversation on institutional credibility as infrastructure.",
    guest: "with a guest economist",
    duration: "34 min",
    src: "/audio/pod-rwanda.mp3",
  },
  {
    id: "pod-cases",
    image: "/images/books/the-bottom-line/systems-that-held-v2.png",
    kind: "related",
    title: "Systems that held: the case studies",
    blurb: "A closer read on Celtel, Atlético, PSG, and Samsung — what each demonstrates about the floor.",
    duration: "28 min",
    src: "/audio/pod-cases.mp3",
  },
];

/* ── localStorage helpers ────────────────────────────────────────── */
export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota / private mode — local-first is best-effort */
  }
}

export const K = {
  notes: `${BOOK_ID}-notes`,
  highlights: `${BOOK_ID}-highlights`,
  bookmarks: `${BOOK_ID}-bookmarks`,
  progress: `${BOOK_ID}-progress`,
  downloads: `${BOOK_ID}-downloads`,
  rate: `${BOOK_ID}-rate`,
};

export const uid = () =>
  `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const fmtTime = (s: number): string => {
  if (!s || isNaN(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

export const RATES = [0.8, 1, 1.25, 1.5, 1.75, 2] as const;

/* ── Branded share card ──────────────────────────────────────────
   Portrait 1080×1350 SVG. Two-colour, premium, citation preserved.
   Returned as an SVG string for inline preview and PNG export. */
export function buildShareCardSVG(opts: {
  quote: string;
  chapterTitle?: string | null;
  dark?: boolean;
}): string {
  const dark = opts.dark ?? true;
  const bg = dark ? "#0d0d0d" : "#ffffff";
  const ink = dark ? "#f2f2f2" : "#161616";
  const faint = dark ? "#8a8a8a" : "#6e6e6e";
  const rule = dark ? "#2a2a2a" : "#e4e4e4";

  const quote = (opts.quote || "").trim().replace(/\s+/g, " ");
  // wrap to ~26 chars/line, max 9 lines
  const words = quote.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > 26) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
    if (lines.length >= 9) break;
  }
  if (line && lines.length < 9) lines.push(line.trim());
  const fontSize = lines.length > 6 ? 58 : lines.length > 4 ? 66 : 76;
  const lineH = fontSize * 1.32;
  const blockH = lines.length * lineH;
  const startY = 540 - blockH / 2 + fontSize;

  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const quoteTspans = lines
    .map(
      (l, i) =>
        `<text x="120" y="${startY + i * lineH}" font-family="Playfair Display, Georgia, serif" font-style="italic" font-size="${fontSize}" fill="${ink}">${esc(
          l
        )}</text>`
    )
    .join("");

  const chapter = opts.chapterTitle
    ? `<text x="120" y="1140" font-family="Space Grotesk, Arial, sans-serif" font-size="22" letter-spacing="3" fill="${faint}">${esc(
        opts.chapterTitle.toUpperCase()
      )}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <rect width="1080" height="1350" fill="${bg}"/>
  <text x="120" y="150" font-family="Space Grotesk, Arial, sans-serif" font-size="24" letter-spacing="6" fill="${faint}">INGOGA LABS · BOOKS</text>
  <text x="120" y="300" font-family="Playfair Display, Georgia, serif" font-size="120" fill="${rule}">“</text>
  ${quoteTspans}
  ${chapter}
  <line x1="120" y1="1185" x2="320" y2="1185" stroke="${ink}" stroke-width="2"/>
  <text x="120" y="1240" font-family="Playfair Display, Georgia, serif" font-size="40" fill="${ink}">${esc(
    BOOK_TITLE
  )}</text>
  <text x="120" y="1285" font-family="Space Grotesk, Arial, sans-serif" font-size="24" letter-spacing="2" fill="${faint}">${esc(
    BOOK_AUTHOR.toUpperCase()
  )}</text>
</svg>`;
}
