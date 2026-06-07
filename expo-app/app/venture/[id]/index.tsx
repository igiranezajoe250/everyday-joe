// Project detail — title, metrics grid, operational workflow, thesis, risks
// + financials. Floating Invest pill.

import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Linking } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Eyebrow, ScreenHeader, BackBtn, StatusPill, RoundedCard,
  CollapsibleSection, Rule,
} from "../../../src/components/primitives";
import { ChevronRight, ExternalLink, InvestIcon } from "../../../src/components/icons";
import { pkLookup, type Project } from "../../../src/data/mock";
import { ink, ink12, ink25, ink55, ink70, paper, FONT, RADIUS } from "../../../src/theme/tokens";
import { useAccent } from "../../../src/theme/accent";

const STATUS_LABEL: Record<Project["status"], string> = {
  "open": "Open",
  "closing-soon": "Closing soon",
  "waitlist": "Waitlist",
};

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { accent } = useAccent();

  const v = pkLookup(id);
  if (!v) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: paper }}>
        <ScreenHeader left={<BackBtn onPress={() => router.back()} />} />
        <View style={{ padding: 40, alignItems: "center" }}>
          <Text style={{ color: ink55 }}>Project not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: paper }}>
      <ScreenHeader left={<BackBtn onPress={() => router.back()} />} />

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Title */}
        <View style={{ paddingHorizontal: 24, paddingTop: 4, paddingBottom: 20 }}>
          <View style={{ marginBottom: 14, flexDirection: "row" }}>
            <StatusPill>{STATUS_LABEL[v.status]}</StatusPill>
          </View>
          <Text style={{
            fontFamily: FONT.displaySemi, fontSize: 30,
            letterSpacing: -0.75, lineHeight: 34, color: ink,
          }}>{v.name}</Text>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: ink70 }}>{v.sector}</Text>
            <Text style={{ color: ink25 }}>·</Text>
            <Text style={{ fontFamily: FONT.body, fontSize: 13, color: ink70 }}>{v.location}</Text>
          </View>

          {v.website ? (
            <Pressable
              onPress={() => Linking.openURL(`https://${v.website}`).catch(() => undefined)}
              style={{
                marginTop: 14, alignSelf: "flex-start",
                paddingHorizontal: 14, height: 32,
                borderRadius: RADIUS.pill, borderWidth: 1, borderColor: ink12,
                flexDirection: "row", alignItems: "center", gap: 8,
              }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 12, color: ink }}>{v.website}</Text>
              <ExternalLink />
            </Pressable>
          ) : null}
        </View>

        {/* Metrics grid */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 24 }}>
          <RoundedCard padding={0} radius={RADIUS.lg}>
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {v.metrics.map((m, i) => {
                const col = i % 2;
                const row = Math.floor(i / 2);
                return (
                  <View key={i} style={{
                    width: "50%", padding: 18,
                    borderRightWidth: col === 0 ? 1 : 0, borderRightColor: ink12,
                    borderTopWidth: row > 0 ? 1 : 0, borderTopColor: ink12,
                  }}>
                    <Eyebrow style={{ marginBottom: 8 }}>{m.label}</Eyebrow>
                    <Text style={{
                      fontFamily: FONT.displaySemi, fontSize: 20,
                      letterSpacing: -0.4, color: ink,
                    }}>{m.value}</Text>
                  </View>
                );
              })}
            </View>
          </RoundedCard>
        </View>

        <Rule />

        {/* Operational workflow */}
        <CollapsibleSection
          title="Operational workflow"
          meta={`${v.operations.length} steps`}>
          <OpsFlow
            steps={v.operations}
            onSelect={(idx) => router.push(`/venture/${v.id}/ops/${idx}`)}
          />
        </CollapsibleSection>

        <Rule />

        {/* Thesis */}
        <CollapsibleSection title="Investment thesis">
          <Text style={{
            fontFamily: FONT.body, fontSize: 16,
            lineHeight: 24, color: ink,
            marginBottom: v.thesis.length ? 20 : 0,
          }}>{v.about}</Text>
          <NumberedList items={v.thesis} />
        </CollapsibleSection>

        <Rule />

        {/* Risks · Financial reports */}
        <CollapsibleSection title="Risks · Financial reports">
          <RisksBlock project={v} />
        </CollapsibleSection>
      </ScrollView>

      {/* Floating Invest */}
      {v.status !== "waitlist" ? (
        <InvestFAB
          label={`Invest in ${v.name}`}
          accent={accent}
          onPress={() => router.push(`/checkout/${v.id}`)}
        />
      ) : null}
    </SafeAreaView>
  );
}

// ─────── sub-components ───────

const OpsFlow = ({
  steps, onSelect,
}: { steps: Project["operations"]; onSelect: (idx: number) => void }) => (
  <View>
    {steps.map((s, i) => (
      <View key={i}>
        <Pressable onPress={() => onSelect(i)}
          style={({ pressed }) => ({
            flexDirection: "row", alignItems: "center", gap: 16,
            borderWidth: 1, borderColor: ink12, borderRadius: RADIUS.md,
            paddingVertical: 16, paddingHorizontal: 18,
            backgroundColor: paper, opacity: pressed ? 0.7 : 1,
          })}>
          <View style={{
            width: 28, height: 28, borderRadius: 14,
            borderWidth: 1, borderColor: ink25,
            alignItems: "center", justifyContent: "center",
          }}>
            <Text style={{
              fontFamily: FONT.mono, fontSize: 10, letterSpacing: 0.6, color: ink70,
            }}>{String(i + 1).padStart(2, "0")}</Text>
          </View>
          <Text style={{ fontFamily: FONT.body, fontSize: 15, color: ink, flex: 1 }}>{s.name}</Text>
          <ChevronRight color={ink25} />
        </Pressable>
        {i < steps.length - 1 ? (
          <View style={{ width: 1, height: 14, backgroundColor: ink25, marginLeft: 32 }} />
        ) : null}
      </View>
    ))}
  </View>
);

const NumberedList = ({ items, muted = false }: { items: string[]; muted?: boolean }) => (
  <View>
    {items.map((s, i) => (
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
          fontFamily: FONT.body, fontSize: 15, lineHeight: 22,
          color: muted ? ink70 : ink, flex: 1,
        }}>{s}</Text>
      </View>
    ))}
  </View>
);

const FinKpi = ({ label, value }: { label: string; value: string }) => (
  <View style={{ flex: 1 }}>
    <Text style={{
      fontFamily: FONT.mono, fontSize: 9, letterSpacing: 0.9,
      textTransform: "uppercase", color: ink55, marginBottom: 6,
    }}>{label}</Text>
    <Text style={{
      fontFamily: FONT.displaySemi, fontSize: 15, color: ink, letterSpacing: -0.2,
    }}>{value}</Text>
  </View>
);

const RisksBlock = ({ project }: { project: Project }) => {
  const f = project.financials;
  return (
    <View>
      <RoundedCard padding={0} radius={RADIUS.lg} style={{ marginBottom: 18 }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 18 }}>
          <View style={{
            flexDirection: "row", justifyContent: "space-between",
            alignItems: "flex-end", marginBottom: 14,
          }}>
            <Eyebrow>Financial snapshot</Eyebrow>
            <Text style={{
              fontFamily: FONT.mono, fontSize: 10, letterSpacing: 0.8,
              textTransform: "uppercase", color: ink55,
            }}>{f.period}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <FinKpi label="Revenue · TTM" value={f.revenue} />
            <FinKpi label="Growth" value={f.growth} />
            <FinKpi label="EBITDA margin" value={f.ebitda} />
          </View>
        </View>
      </RoundedCard>
      {project.risks?.length ? <NumberedList items={project.risks} muted /> : null}
    </View>
  );
};

const InvestFAB = ({
  label, accent, onPress,
}: { label: string; accent: string; onPress: () => void }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ position: "absolute", right: 16, bottom: 16 }}>
      <Pressable
        onPress={() => (open ? onPress() : setOpen(true))}
        style={{
          flexDirection: "row", alignItems: "center",
          backgroundColor: accent, borderRadius: 28,
          width: open ? 240 : 56, height: 56,
          paddingRight: open ? 20 : 0,
          overflow: "hidden",
          shadowColor: "#000", shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.22, shadowRadius: 12, elevation: 8,
        }}>
        <View style={{
          width: 56, height: 56, alignItems: "center", justifyContent: "center",
        }}>
          <InvestIcon />
        </View>
        {open ? (
          <Text style={{
            fontFamily: FONT.bodyMedium, fontSize: 14, color: "#fff",
          }}>{label}</Text>
        ) : null}
      </Pressable>
    </View>
  );
};
