// Global accent preference, persisted to AsyncStorage. Mirrors the web
// wireframe's "Tweaks" accent picker; we surface this from the Settings screen.
// Using a tiny Context (no redux/zustand) so the app stays Expo-Go-safe.

import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AccentKey, PK_PALETTES } from "./palettes";

const KEY = "@pk:accent";

type AccentCtx = {
  accentKey: AccentKey;
  accent: string;
  setAccent: (k: AccentKey) => void;
};

const Ctx = createContext<AccentCtx>({
  accentKey: "crimson",
  accent: PK_PALETTES.crimson.accent,
  setAccent: () => undefined,
});

export const AccentProvider = ({ children }: { children: React.ReactNode }) => {
  const [accentKey, setAccentKey] = useState<AccentKey>("crimson");

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => {
      if (v && (v in PK_PALETTES)) setAccentKey(v as AccentKey);
    }).catch(() => {/* first launch — ignore */});
  }, []);

  const setAccent = (k: AccentKey) => {
    setAccentKey(k);
    AsyncStorage.setItem(KEY, k).catch(() => {/* non-fatal */});
  };

  return (
    <Ctx.Provider value={{ accentKey, accent: PK_PALETTES[accentKey].accent, setAccent }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAccent = () => useContext(Ctx);
