import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Syncabi — Build a business worth investing in.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0f0f0f",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "4px",
            background: "#8B3A2F",
          }}
        />

        {/* Top row: logo + pill */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.5px",
            }}
          >
            Syncabi
          </span>
          <span
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "#8B3A2F",
              background: "rgba(139,58,47,0.12)",
              border: "1px solid rgba(139,58,47,0.3)",
              borderRadius: "100px",
              padding: "5px 14px",
              letterSpacing: "0.02em",
            }}
          >
            syncabi.com
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.08,
              letterSpacing: "-2px",
              maxWidth: "820px",
            }}
          >
            Build a business worth investing in.
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "rgba(255,255,255,0.45)",
              fontWeight: 400,
              letterSpacing: "-0.2px",
              maxWidth: "560px",
            }}
          >
            Most Rwandan businesses are worth more than they can prove. Syncabi changes that.
          </div>
        </div>

        {/* Bottom row: tagline + dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#8B3A2F",
              }}
            />
            <span
              style={{
                fontSize: "15px",
                color: "rgba(255,255,255,0.35)",
                fontWeight: 400,
                letterSpacing: "0.02em",
              }}
            >
              Invest · Portfolio · Transfers · Wallet
            </span>
          </div>
          <div
            style={{
              display: "flex",
              gap: "8px",
            }}
          >
            {[0.15, 0.25, 0.4].map((opacity, i) => (
              <div
                key={i}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: `rgba(139,58,47,${opacity})`,
                }}
              />
            ))}
            <div
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: "#8B3A2F",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
