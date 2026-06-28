import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ingoga Labs — Curiosity, Applied.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0d1011",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top copper accent */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "3px", background: "#9b4f32" }} />

        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#f5f3ec", letterSpacing: "-0.05em", lineHeight: 1 }}>
            INGOGA{"\n"}LABS
          </span>
          <span style={{
            fontSize: "11px", fontWeight: 500, color: "#9b4f32",
            background: "rgba(155,79,50,0.12)", border: "1px solid rgba(155,79,50,0.3)",
            borderRadius: "100px", padding: "4px 14px", letterSpacing: "0.08em",
          }}>
            KIGALI · RWANDA
          </span>
        </div>

        {/* Main headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ fontSize: "72px", fontWeight: 700, color: "#f5f3ec", lineHeight: 0.88, letterSpacing: "-3px", maxWidth: "860px" }}>
            CURIOSITY,{" "}
            <span style={{ color: "#a9d9ec" }}>APPLIED.</span>
          </div>
          <div style={{ fontSize: "20px", color: "rgba(245,243,236,0.45)", fontWeight: 400, letterSpacing: "-0.2px", maxWidth: "580px", lineHeight: 1.5 }}>
            An independent research and development lab investigating complex problems from Kigali, Rwanda.
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "24px" }}>
            {["Health", "Agriculture", "Manufacturing", "Mobility"].map((tag) => (
              <span key={tag} style={{ fontSize: "12px", color: "rgba(245,243,236,0.28)", letterSpacing: "0.06em" }}>
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
          <span style={{ fontSize: "12px", color: "rgba(245,243,236,0.25)", letterSpacing: "0.06em" }}>
            ingogalabs.com
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
