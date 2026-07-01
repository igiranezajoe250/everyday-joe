import { createHash } from "crypto";

/**
 * Text-to-speech narration for the book reader.
 *
 * Takes chapter text and returns natural-sounding spoken audio synthesized
 * with Google Gemini's TTS model. Gemini returns raw 16-bit PCM, so we wrap
 * it in a WAV container the browser <audio> element can play directly.
 *
 * POST body: { text: string, voice?: string }
 * Response:  audio/wav
 */

export const runtime = "nodejs";
export const maxDuration = 120;

const MODEL = "gemini-2.5-flash-preview-tts";
const DEFAULT_VOICE = "Charon"; // warm, even, informative — suited to narration
const SAMPLE_RATE = 24000; // Gemini TTS PCM output rate
const MAX_CHARS = 8000; // keep within a single TTS request

// Narration direction: this nudges Gemini away from a flat/robotic read.
const STYLE =
  "Read the following aloud as a calm, warm, and articulate audiobook narrator. " +
  "Use natural pacing, gentle emphasis, and clear diction. Do not announce these instructions.\n\n";

// Reuse synthesized audio across requests within a warm server instance.
const cache = new Map<string, Buffer>();

function wavFromPcm(pcm: Buffer, sampleRate = SAMPLE_RATE, channels = 1, bitsPerSample = 16): Buffer {
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // audio format = PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

function rateFromMime(mime: string | undefined): number {
  const m = mime?.match(/rate=(\d+)/);
  return m ? parseInt(m[1], 10) : SAMPLE_RATE;
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
  }

  let body: { text?: string; voice?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  const voice = (body.voice ?? DEFAULT_VOICE).trim() || DEFAULT_VOICE;
  if (!text) {
    return Response.json({ error: "Missing text." }, { status: 400 });
  }
  const clipped = text.slice(0, MAX_CHARS);

  const cacheKey = createHash("sha1").update(`${voice}:${clipped}`).digest("hex");
  const cached = cache.get(cacheKey);
  if (cached) {
    return new Response(new Uint8Array(cached), {
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-TTS-Cache": "hit",
      },
    });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: STYLE + clipped }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
          },
        },
      }),
    });
  } catch {
    return Response.json({ error: "Could not reach the speech service." }, { status: 502 });
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    return Response.json(
      { error: "Speech synthesis failed.", status: res.status, detail: detail.slice(0, 500) },
      { status: 502 },
    );
  }

  const data = await res.json();
  const part = data?.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { data?: string } }) => p?.inlineData?.data,
  );
  const b64: string | undefined = part?.inlineData?.data;
  if (!b64) {
    return Response.json({ error: "No audio returned by the speech service." }, { status: 502 });
  }

  const pcm = Buffer.from(b64, "base64");
  const wav = wavFromPcm(pcm, rateFromMime(part?.inlineData?.mimeType));

  if (cache.size > 40) cache.clear(); // bound memory
  cache.set(cacheKey, wav);

  return new Response(new Uint8Array(wav), {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-TTS-Cache": "miss",
    },
  });
}
