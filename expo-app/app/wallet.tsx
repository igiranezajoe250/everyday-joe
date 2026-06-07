// Wallet — invested + available + pending + holdings.

import React from "react";
import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Eyebrow, ScreenHeader, BackBtn, RoundedCard, AllocBar, CCButton, Rule,
} from "../src/components/primitives";
import { PK_WALLET } from "../src/data/mock";
import { fmtRWF } from "../src/utils/format";
import { ink, ink12, ink55, ink70, paper, FONT, RADIUS } from "../src/theme/tokens";
import { useAccent } from "../src/theme/accent";

export default function WalletScreen() {
  const router = useRouter();
  const { accent } = useAccent();
  const w = PK_WALLET;

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: paper }}>
      <ScreenHeader
        left={<BackBtn onPress={() => router.back()} />}
        right={<Eyebrow>Wallet</Eyebrow>}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}>
          <Eyebrow style={{ marginBottom: 12 }}>Available · RWF</Eyebrow>
          <Text style={{
            fontFamily: FONT.displaySemi, fontSize: 44, letterSpacing: -1,
            color: ink, marginBottom: 18,
          }}>{fmtRWF(w.available).replace("RWF ", "")}</Text>

          <RoundedCard padding={0} radius={RADIUS.lg}>
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, padding: 18, borderRightWidth: 1, borderRightColor: ink12 }}>
                <Eyebrow style={{ marginBottom: 8 }}>Invested</Eyebrow>
                <Text style={{ fontFamily: FONT.displaySemi, fontSize: 18, color: ink }}>
                  {fmtRWF(w.invested)}
                </Text>
              </View>
              <View style={{ flex: 1, padding: 18 }}>
                <Eyebrow style={{ marginBottom: 8 }}>Available</Eyebrow>
                <Text style={{ fontFamily: FONT.displaySemi, fontSize: 18, color: ink }}>
                  {fmtRWF(w.available)}
                </Text>
              </View>
            </View>
          </RoundedCard>
        </View>

        <Rule />

        <View style={{ paddingHorizontal: 24, paddingTop: 22, paddingBottom: 8 }}>
          <Eyebrow style={{ marginBottom: 12 }}>Holdings</Eyebrow>
          {w.holdings.map((h) => (
            <View key={h.id} style={{ paddingVertical: 6 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 15, color: ink }}>{h.label}</Text>
                <Text style={{ fontFamily: FONT.mono, fontSize: 13, color: ink }}>{h.amount}</Text>
              </View>
              <AllocBar label={h.sub} percent={h.pct} accent={accent} />
            </View>
          ))}
        </View>

        <Rule />

        <View style={{ paddingHorizontal: 24, paddingTop: 22 }}>
          <Eyebrow style={{ marginBottom: 12 }}>Pending</Eyebrow>
          {w.pending.map((p, i) => (
            <View key={p.id} style={{
              paddingVertical: 14,
              borderTopWidth: i === 0 ? 1 : 0, borderTopColor: ink12,
              borderBottomWidth: 1, borderBottomColor: ink12,
              flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
            }}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontFamily: FONT.body, fontSize: 14, color: ink }}>{p.title}</Text>
                <Text style={{
                  fontFamily: FONT.mono, fontSize: 10, letterSpacing: 0.8,
                  color: ink55, marginTop: 4, textTransform: "uppercase",
                }}>{p.sub}</Text>
              </View>
              <Text style={{ fontFamily: FONT.mono, fontSize: 13, color: ink }}>{p.amount}</Text>
            </View>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20, paddingTop: 24, gap: 10 }}>
          <CCButton variant="solid" accent={accent} fullWidth
            onPress={() => router.push("/money/add")}>Add money</CCButton>
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
      </ScrollView>
    </SafeAreaView>
  );
}
