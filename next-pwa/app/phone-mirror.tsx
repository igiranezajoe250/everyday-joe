"use client";

import { useEffect, useState } from "react";

type PhoneMirrorProps = {
  appUrl: string;
};

export function PhoneMirror({ appUrl }: PhoneMirrorProps) {
  const [viewMode, setViewMode] = useState<"auto" | "mobile" | "web">("auto");
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [frameReady, setFrameReady] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  useEffect(() => {
    const check = () => {
      const mobile =
        window.innerWidth <= 520 ||
        /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(
          navigator.userAgent
        );
      setIsMobileDevice(mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const showMobile =
    viewMode === "mobile" || (viewMode === "auto" && isMobileDevice);

  const toggleView = () => {
    if (viewMode === "auto") {
      setViewMode(isMobileDevice ? "web" : "mobile");
    } else if (viewMode === "mobile") {
      setViewMode("web");
    } else {
      setViewMode("mobile");
    }
  };

  const sep = appUrl.includes("?") ? "&" : "?";
  const mobileUrl = appUrl;
  const webUrl = `${appUrl}${sep}layout=web`;
  const frameSrc = showMobile ? mobileUrl : webUrl;

  // Re-arm the fade when the embedded layout swaps, so the new view eases in.
  useEffect(() => {
    setFrameReady(false);
  }, [frameSrc]);

  return (
    <>
      <main className={showMobile ? "portal-shell portal-mobile" : "portal-shell portal-web"}>
        <iframe
          title="Everyday app"
          src={frameSrc}
          className="app-frame"
          allow="clipboard-read; clipboard-write"
          onLoad={() => setFrameReady(true)}
          style={{
            opacity: frameReady ? 1 : 0,
            transition: "opacity 320ms ease",
          }}
        />
      </main>

      <button
        onClick={toggleView}
        className={`view-toggle ${showMobile ? "view-toggle--dark" : ""}`}
        aria-label={showMobile ? "Switch to web view" : "Switch to mobile view"}
        title={showMobile ? "Switch to web view" : "Switch to mobile view"}
      >
        {showMobile ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="3" />
            <path d="M12 18h.01" />
          </svg>
        )}
      </button>
    </>
  );
}
