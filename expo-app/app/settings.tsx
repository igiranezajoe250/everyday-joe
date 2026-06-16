// Settings — grouped list, plus accent picker (which used to live in the
// Tweaks panel on the web wireframe).

import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Eyebrow, ScreenHeader, BackBtn, Avatar,
} from "../src/components/primitives";
import { ChevronRight, CheckIcon } from "../src/components/icons";
import { PK_SETTINGS, PK_PORTFOLIO } from "../src/data/mock";
import { ink, ink12, ink25, ink55, ink70, paper, FONT } from "../src/theme/tokens";
import { useAccent } from "../src/theme/accent";
import { PK_PALETTES, type AccentKey } from "../src/theme/palettes";

export default function SettingsScreen() {
  const router = useRouter();
  const { accentKey, setAccent } = useAccent();
  const palettes = Object.entries(PK_PALETTES) as [AccentKey, (typeof PK_PALETTES)[AccentKey]][];

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: paper }}>
      <ScreenHeader
        left={<BackBtn onPress={() => router.back()} />}
        right={<Eyebrow>Profile</Eyebrow>}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile chip */}
        <View style={{
          paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28,
          flexDirection: "row", alignItems: "center", gap: 14,
        }}>
          <Avatar initials={PK_PORTFOLIO.user.initials} size={52} />
          <View>
            <Text style={{ fontFamily: FONT.displaySemi, fontSize: 20, color: ink }}>
              {PK_PORTFOLIO.user.name}
            </Text>
            <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1.2,
              color: ink55, marginTop: 4, textTransform: "uppercase" }}>
              Verified · RWF account
            </Text>
          </View>
        </View>

        {/* Accent picker — equivalent of the wireframe Tweaks accent control */}
        <View style={{ paddingHorizontal: 24, paddingBottom: 18 }}>
          <Eyebrow style={{ marginBottom: 12 }}>Accent</Eyebrow>
          <View style={{ flexDirection: "row", gap: 12 }}>
            {palettes.map(([key, p]) => {
              const on = key === accentKey;
              return (
                <Pressable key={key} onPress={() => setAccent(key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Accent ${p.label}`}
                  style={{
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: p.accent,
                    borderWidth: 2, borderColor: on ? ink : "transparent",
                    alignItems: "center", justifyContent: "center",
                  }}>
                  {on ? <CheckIcon color="#fff" /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Setting groups */}
        {PK_SETTINGS.map((g) => (
          <View key={g.group} style={{ marginTop: 18 }}>
            <View style={{ paddingHorizontal: 24, paddingBottom: 10 }}>
              <Eyebrow>{g.group}</Eyebrow>
            </View>
            {g.items.map((it, i) => {
              const destructive = "destructive" in it && it.destructive;
              return (
                <Pressable key={it.id}
                  onPress={() => undefined}
                  style={({ pressed }) => ({
                    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    paddingHorizontal: 24, paddingVertical: 16,
                    borderTopWidth: i === 0 ? 1 : 0, borderTopColor: ink12,
                    borderBottomWidth: 1, borderBottomColor: ink12,
                    opacity: pressed ? 0.6 : 1,
                  })}>
                  <Text style={{
                    fontFamily: FONT.body, fontSize: 15,
                    color: destructive ? "#A41A1A" : ink,
                  }}>{it.label}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                    {"meta" in it && it.meta ? (
                      <Text style={{ fontFamily: FONT.mono, fontSize: 11, color: ink55, letterSpacing: 0.4 }}>
                        {it.meta}
                      </Text>
                    ) : null}
                    {!destructive ? <ChevronRight color={ink25} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <Text style={{ fontFamily: FONT.mono, fontSize: 10, color: ink55, letterSpacing: 1.0, textTransform: "uppercase" }}>
            Everyday · v0.1.0 · Prototype
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
