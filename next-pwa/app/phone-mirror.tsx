"use client";

import { useEffect } from "react";

type PhoneMirrorProps = {
  appUrl: string;
};

export function PhoneMirror({ appUrl }: PhoneMirrorProps) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // The app still runs if the browser blocks service workers on localhost.
    });
  }, []);

  return (
    <main className="portal-shell">
      <section className="phone-stage" aria-label="Everyday Joe phone preview">
        <div className="phone-device">
          <div className="phone-speaker" aria-hidden="true" />
          <iframe
            title="Everyday Joe app"
            src={appUrl}
            className="phone-screen"
            allow="clipboard-read; clipboard-write"
          />
        </div>
      </section>
    </main>
  );
}
