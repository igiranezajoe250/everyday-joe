"use client";

import { useEffect, useState } from "react";

type PhoneMirrorProps = {
  appUrl: string;
};

export function PhoneMirror({ appUrl }: PhoneMirrorProps) {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

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

  const showMobile = isMobileDevice;
  const sep = appUrl.includes("?") ? "&" : "?";
  const voiceBase = process.env.NEXT_PUBLIC_VOICE_BASE;
  const voiceParam = voiceBase ? `&voiceBase=${encodeURIComponent(voiceBase)}` : "";
  const mobileUrl = `${appUrl}${voiceParam}`;
  const webUrl = `${appUrl}${sep}layout=web${voiceParam}`;
  const frameSrc = showMobile ? mobileUrl : webUrl;

  return (
    <main className={showMobile ? "portal-shell portal-mobile" : "portal-shell portal-web"}>
      <iframe
        title="Everyday app"
        src={frameSrc}
        className="app-frame"
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
