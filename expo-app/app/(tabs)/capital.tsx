// Capital home — big balance, three action pills, privacy toggle.

import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  Eyebrow, ScreenHeader, IconBtn, Avatar, CCButton,
} from "../../src/components/primitives";
import { EyeIcon, EyeOffIcon, WalletIcon } from "../../src/components/icons";
import { PK_PORTFOLIO } from "../../src/data/mock";
import { ink, ink12, ink40, ink55, ink70, paper, FONT } from "../../src/theme/tokens";
import { useAccent } from "../../src/theme/accent";

export default function CapitalScreen() {
  const router = useRouter();
  const { accent } = useAccent();
  const p = PK_PORTFOLIO;
  const millions = (p.total / 1000000).toFixed(2);
  const [hidden, setHidden] = useState(false);

  const tap = () => {
    Haptics.selectionAsync().catch(() => undefined);
    setHidden((h) => !h);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: paper }}>
      <ScreenHeader
        left={<Eyebrow>Everyday</Eyebrow>}
        right={
          <>
            <IconBtn onPress={() => router.push("/wallet")}>
              <WalletIcon />
            </IconBtn>
            <Pressable
              onPress={() => router.push("/settings")}
              accessibilityRole="button"
              accessibilityLabel="Profile"
              hitSlop={6}
            >
              <Avatar initials={p.user.initials} size={36} />
            </Pressable>
          </>
        }
      />

      {/* Balance block */}
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
        <Text style={{ fontSize: 15, color: ink70, marginBottom: 36, fontFamily: FONT.body }}>
          Good morning, {p.user.name}.
        </Text>

        <View style={{
          flexDirection: "row", justifyContent: "space-between",
          alignItems: "center", marginBottom: 14,
        }}>
          <Eyebrow>Your capital · RWF</Eyebrow>
          <Pressable
            onPress={tap}
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show balance" : "Hide balance"}
            style={{
              width: 32, height: 32, borderRadius: 16,
              borderWidth: 1, borderColor: ink12, backgroundColor: paper,
              alignItems: "center", justifyContent: "center",
            }}
          >
            {hidden ? <EyeOffIcon /> : <EyeIcon />}
          </Pressable>
        </View>

        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
          <Text style={{
            fontFamily: FONT.displaySemi, fontSize: 80,
            letterSpacing: -2.4, color: ink, lineHeight: 80,
          }}>
            {hidden ? "••" : millions}
          </Text>
          <Text style={{
            fontFamily: FONT.displaySemi, fontSize: 28, color: ink55,
            paddingBottom: 8,
          }}>M</Text>
        </View>

        <View style={{ marginTop: 18, flexDirection: "row", alignItems: "center" }}>
          {hidden ? (
            <Text style={{ fontFamily: FONT.mono, fontSize: 11, color: ink40, letterSpacing: 0.9 }}>
              •••••• ••••••
            </Text>
          ) : (
            <>
              <Text style={{
                fontFamily: FONT.mono, fontSize: 11, color: accent,
                letterSpacing: 0.9, textTransform: "uppercase", marginRight: 8,
              }}>↑ {p.changePct}%</Text>
              <Text style={{
                fontFamily: FONT.mono, fontSize: 11, color: ink70,
                letterSpacing: 0.9, textTransform: "uppercase",
              }}>{p.changeWindow}</Text>
            </>
          )}
        </View>
      </View>

      {/* Three actions */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 28, gap: 10 }}>
        <CCButton variant="solid" accent={accent} fullWidth
          onPress={() => router.push("/money/add")}>
          Add money
        </CCButton>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <CCButton variant="ghost" size="md" fullWidth
              onPress={() => router.push("/money/move")}>Move</CCButton>
          </View>
          <View style={{ flex: 1 }}>
            <CCButton variant="ghost" size="md" fullWidth
              onPress={() => router.push("/money/withdraw")}>Withdraw</CCButton>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
