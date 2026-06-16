// Ops step detail — KPI grid, activities, partners, website link.

import React from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Eyebrow, ScreenHeader, BackBtn, RoundedCard, Rule,
} from "@/components/primitives";
import { ExternalLink } from "@/components/icons";
import { Operation, pkLookup } from "@/data/mock";
import { ink, ink12, ink25, ink55, ink70, paper, FONT, RADIUS } from "@/theme/tokens";

export default function OpsDetailScreen() {
  const { id, step } = useLocalSearchParams<{ id: string; step: string }>();
  const router = useRouter();

  const v = pkLookup(id);
  const idx = Number(step) || 0;
  const op = v?.operations?.[idx];

  if (!v || !op) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: paper }}>
        <ScreenHeader left={<BackBtn onPress={() => router.back()} />} />
        <View style={{ padding: 40, alignItems: "center" }}>
          <Text style={{ color: ink55 }}>Step details not available.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: paper }}>
      <ScreenHeader
        left={<BackBtn onPress={() => router.back()} />}
        right={<Eyebrow>{v.name}</Eyebrow>}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 24 }}>
          <Eyebrow style={{ marginBottom: 10 }}>
            Step {String(idx + 1).padStart(2, "0")} · Operations
          </Eyebrow>
          <Text style={{
            fontFamily: FONT.displaySemi, fontSize: 30,
            letterSpacing: -0.75, lineHeight: 34, color: ink,
          }}>{op.name}</Text>
          <Text style={{
            fontFamily: FONT.body, fontSize: 15,
            lineHeight: 23, color: ink70, marginTop: 14,
          }}>{op.detail}</Text>
        </View>

        <Rule />

        {op.kpis?.length ? (
          <>
            <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24 }}>
              <Eyebrow style={{ marginBottom: 14, paddingHorizontal: 4 }}>Key indicators</Eyebrow>
              <RoundedCard padding={0} radius={RADIUS.lg}>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {op.kpis.map((k: Operation["kpis"][number], i: number) => (
                    <View key={i} style={{
                      width: "50%", padding: 18,
                      borderRightWidth: i % 2 === 0 ? 1 : 0, borderRightColor: ink12,
                      borderTopWidth: i >= 2 ? 1 : 0, borderTopColor: ink12,
                    }}>
                      <Eyebrow style={{ marginBottom: 8 }}>{k.label}</Eyebrow>
                      <Text style={{
                        fontFamily: FONT.displaySemi, fontSize: 22,
                        letterSpacing: -0.5, color: ink,
                      }}>{k.value}</Text>
                    </View>
                  ))}
                </View>
              </RoundedCard>
              {op.timeline ? (
                <View style={{
                  marginTop: 16, flexDirection: "row", justifyContent: "space-between",
                }}>
                  <Eyebrow>Timeline</Eyebrow>
                  <Text style={{
                    fontFamily: FONT.mono, fontSize: 11, letterSpacing: 0.6, color: ink,
                  }}>{op.timeline}</Text>
                </View>
              ) : null}
            </View>
            <Rule />
          </>
        ) : null}

        {op.activities?.length ? (
          <>
            <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}>
              <Eyebrow style={{ marginBottom: 14 }}>Activities</Eyebrow>
              {op.activities.map((a: string, i: number) => (
                <View key={i} style={{
                  flexDirection: "row", gap: 18, paddingVertical: 16,
                  borderTopWidth: i === 0 ? 1 : 0, borderTopColor: ink12,
                  borderBottomWidth: 1, borderBottomColor: ink12,
                }}>
                  <Text style={{
                    fontFamily: FONT.mono, fontSize: 10, letterSpacing: 0.8,
                    color: ink55, paddingTop: 3, width: 18,
                  }}>{String(i + 1).padStart(2, "0")}</Text>
                  <Text style={{
                    fontFamily: FONT.body, fontSize: 15, lineHeight: 22, color: ink, flex: 1,
                  }}>{a}</Text>
                </View>
              ))}
            </View>
            <Rule />
          </>
        ) : null}

        {op.partners?.length ? (
          <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 8 }}>
            <Eyebrow style={{ marginBottom: 14 }}>Partners</Eyebrow>
            {op.partners.map((p: string, i: number) => (
              <View key={i} style={{
                flexDirection: "row", alignItems: "center", gap: 14,
                paddingVertical: 14,
                borderTopWidth: i === 0 ? 1 : 0, borderTopColor: ink12,
                borderBottomWidth: 1, borderBottomColor: ink12,
              }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: ink25 }} />
                <Text style={{ fontFamily: FONT.body, fontSize: 15, color: ink }}>{p}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {v.website ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 }}>
            <Pressable
              onPress={() => Linking.openURL(`https://${v.website}`).catch(() => undefined)}
              style={{
                height: 48, paddingHorizontal: 16,
                borderRadius: RADIUS.pill, borderWidth: 1, borderColor: ink12,
                backgroundColor: paper,
                flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 14, color: ink }}>
                Visit {v.website}
              </Text>
              <ExternalLink size={12} />
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
