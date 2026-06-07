// Investment checkout — Amount → Source → Review → Done.

import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  Eyebrow, ScreenHeader, BackBtn, CCButton, RoundedCard, NumericKeypad,
} from "../../src/components/primitives";
import { CheckBig } from "../../src/components/icons";
import { pkLookup, PK_SOURCES, type Project } from "../../src/data/mock";
import { ink, ink12, ink25, ink55, ink70, paper, paperSoft, FONT, RADIUS } from "../../src/theme/tokens";
import { useAccent } from "../../src/theme/accent";

const STEPS = ["Amount", "Source", "Review", "Done"] as const;
type StepName = typeof STEPS[number];

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { accent } = useAccent();

  const v = pkLookup(id);
  if (!v) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: paper }}>
        <ScreenHeader left={<BackBtn onPress={() => router.back()} />} />
      </SafeAreaView>
    );
  }

  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(0);
  const [source, setSource] = useState<string>("cash");

  const name: StepName = STEPS[step];
  const blocked = name === "Amount" && amount <= 0;

  const next = () => {
    Haptics.selectionAsync().catch(() => undefined);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const back = () => (step === 0 ? router.back() : setStep((s) => s - 1));

  const cta =
    name === "Amount" ? "Continue" :
    name === "Source" ? "Review investment" :
    name === "Review" ? "Confirm investment" :
    "Back to Capital";

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: paper }}>
      <ScreenHeader
        left={<BackBtn onPress={back} />}
        right={
          <Text style={{
            fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1.2,
            textTransform: "uppercase", color: ink70,
          }}>{step + 1} / {STEPS.length}</Text>
        }
      />

      <View style={{
        marginHorizontal: 24, marginTop: 14,
        height: 3, backgroundColor: ink12, borderRadius: 999,
      }}>
        <View style={{
          height: 3, borderRadius: 999, backgroundColor: accent,
          width: `${((step + 1) / STEPS.length) * 100}%`,
        }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 20 }}
        style={{ flex: 1 }}>
        {name === "Amount" ? (
          <AmountStep project={v} amount={amount} setAmount={setAmount} />
        ) : null}
        {name === "Source" ? (
          <SourceStep amount={amount} source={source} setSource={setSource} />
        ) : null}
        {name === "Review" ? (
          <ReviewStep project={v} amount={amount} source={source} />
        ) : null}
        {name === "Done" ? (
          <DoneStep project={v} amount={amount} />
        ) : null}
      </ScrollView>

      <View style={{
        backgroundColor: paper, borderTopWidth: 1, borderTopColor: ink12,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
      }}>
        {name === "Done" ? (
          <CCButton variant="solid" accent={accent} fullWidth
            onPress={() => router.replace("/(tabs)/capital")}>
            Back to Capital
          </CCButton>
        ) : (
          <CCButton variant="solid" accent={accent} fullWidth
            disabled={blocked} onPress={next}>{cta}</CCButton>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─────── Amount ───────

const AmountStep = ({
  project, amount, setAmount,
}: { project: Project; amount: number; setAmount: (n: number) => void }) => {
  const presets = [100000, 250000, 500000, 1000000];
  const display = amount > 0 ? Number(amount).toLocaleString("en-US") + ".00" : "000.00";
  const placeholder = amount === 0;

  const onKey = (k: string) => {
    if (k === "back") setAmount(Math.floor(amount / 10));
    else if (k === "00") {
      const next = amount * 100;
      if (next <= 999999999) setAmount(next);
    } else {
      const next = amount * 10 + Number(k);
      if (next <= 999999999) setAmount(next);
    }
  };

  return (
    <View>
      <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: 28 }}>
        <Eyebrow style={{ marginBottom: 12 }}>Investing in</Eyebrow>
        <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 16, color: ink, marginBottom: 28 }}>
          {project.name}
        </Text>
        <Eyebrow style={{ marginBottom: 14 }}>Amount</Eyebrow>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10 }}>
          <Text style={{
            fontFamily: FONT.displaySemi, fontSize: 52, letterSpacing: -1.6,
            color: placeholder ? ink25 : ink,
          }}>{display}</Text>
          <Text style={{
            fontFamily: FONT.mono, fontSize: 16, color: ink55,
            letterSpacing: 0.6, paddingBottom: 8,
          }}>RWF</Text>
        </View>
        <Text style={{
          fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1.0,
          color: ink55, marginTop: 12, textTransform: "uppercase",
        }}>Minimum · {project.minInvest}</Text>
      </View>

      <View style={{
        flexDirection: "row", gap: 8, justifyContent: "center", marginBottom: 16,
      }}>
        {presets.map((p) => {
          const on = p === amount;
          return (
            <Pressable key={p} onPress={() => setAmount(p)}
              style={{
                height: 32, paddingHorizontal: 14, borderRadius: 999,
                borderWidth: 1, borderColor: on ? ink : ink12,
                backgroundColor: on ? ink : paper,
                alignItems: "center", justifyContent: "center",
              }}>
              <Text style={{
                fontFamily: FONT.mono, fontSize: 10, letterSpacing: 0.8,
                textTransform: "uppercase",
                color: on ? "#fff" : ink70,
              }}>{p.toLocaleString("en-US")}</Text>
            </Pressable>
          );
        })}
      </View>

      <NumericKeypad onPress={onKey} />
    </View>
  );
};

// ─────── Source ───────

const SourceStep = ({
  amount, source, setSource,
}: { amount: number; source: string; setSource: (v: string) => void }) => (
  <View>
    <Eyebrow style={{ marginBottom: 8 }}>Investing</Eyebrow>
    <Text style={{
      fontFamily: FONT.displaySemi, fontSize: 32,
      letterSpacing: -0.7, marginBottom: 36, color: ink,
    }}>RWF {Number(amount).toLocaleString("en-US")}</Text>

    <Eyebrow style={{ marginBottom: 14 }}>Funding source</Eyebrow>
    <View style={{ gap: 10 }}>
      {PK_SOURCES.map((s) => {
        const on = s.id === source;
        const insufficient = s.available != null && s.available < amount;
        return (
          <Pressable key={s.id}
            disabled={insufficient}
            onPress={() => setSource(s.id)}
            style={{
              flexDirection: "row", justifyContent: "space-between",
              alignItems: "center",
              padding: 18, borderRadius: RADIUS.md,
              borderWidth: on ? 2 : 1, borderColor: on ? ink : ink12,
              backgroundColor: paper,
              opacity: insufficient ? 0.4 : 1,
            }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 15, color: ink }}>
                {s.label}
              </Text>
              <Text style={{
                fontFamily: FONT.mono, fontSize: 10, letterSpacing: 0.8,
                color: ink55, marginTop: 6, textTransform: "uppercase",
              }}>
                {s.available != null
                  ? `Available · RWF ${s.available.toLocaleString("en-US")}`
                  : "Linked account"}
                {insufficient ? " · Insufficient" : ""}
              </Text>
            </View>
            <View style={{
              width: 22, height: 22, borderRadius: 11,
              borderWidth: 1, borderColor: on ? ink : ink25,
              alignItems: "center", justifyContent: "center",
            }}>
              {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: ink }} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  </View>
);

// ─────── Review ───────

const ReviewStep = ({
  project, amount, source,
}: { project: Project; amount: number; source: string }) => {
  const sourceLabel = PK_SOURCES.find((s) => s.id === source)?.label || "—";
  const rows: [string, string][] = [
    ["Project", project.name],
    ["Amount", "RWF " + Number(amount).toLocaleString("en-US")],
    ["Source", sourceLabel],
    ["Projected yield", project.yieldRange],
    ["Lock-in", `${project.lockMonths} months`],
    ["Fee", "Waived"],
  ];
  return (
    <View>
      <Eyebrow style={{ marginBottom: 8 }}>Review</Eyebrow>
      <Text style={{
        fontFamily: FONT.displaySemi, fontSize: 28, letterSpacing: -0.6,
        lineHeight: 32, marginBottom: 32, maxWidth: 280, color: ink,
      }}>Confirm your investment.</Text>

      <RoundedCard padding={0} radius={RADIUS.lg}>
        {rows.map(([k, val], i) => {
          const isMono = /RWF|Waived/.test(val);
          return (
            <View key={k} style={{
              flexDirection: "row", justifyContent: "space-between",
              alignItems: "flex-end",
              paddingHorizontal: 20, paddingVertical: 16,
              borderBottomWidth: i < rows.length - 1 ? 1 : 0,
              borderBottomColor: ink12,
            }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 13, color: ink55 }}>{k}</Text>
              <Text style={{
                fontFamily: isMono ? FONT.mono : FONT.body,
                fontSize: 14, color: ink, letterSpacing: isMono ? 0.3 : 0,
                textAlign: "right", maxWidth: "65%",
              }}>{val}</Text>
            </View>
          );
        })}
      </RoundedCard>

      <View style={{
        marginTop: 18, padding: 16, borderRadius: RADIUS.md,
        backgroundColor: paperSoft,
      }}>
        <Text style={{
          fontFamily: FONT.body, fontSize: 12, color: ink70, lineHeight: 19,
        }}>
          By confirming you authorise Poketee to allocate funds from your selected
          source into {project.name}. Capital is locked for the stated period.
          Projected yields are not guaranteed.
        </Text>
      </View>
    </View>
  );
};

// ─────── Done ───────

const DoneStep = ({ project, amount }: { project: Project; amount: number }) => {
  const ref = "PK-INV-2026-" + Math.floor(Math.random() * 9000 + 1000);
  return (
    <View style={{ paddingTop: 8 }}>
      <View style={{
        width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: ink,
        alignItems: "center", justifyContent: "center", marginBottom: 32,
      }}>
        <CheckBig />
      </View>
      <Text style={{
        fontFamily: FONT.displaySemi, fontSize: 32, letterSpacing: -0.8,
        lineHeight: 36, maxWidth: 280, color: ink,
      }}>Investment confirmed.</Text>
      <Text style={{
        fontFamily: FONT.body, fontSize: 15, color: ink70, marginTop: 16, lineHeight: 23,
      }}>
        RWF {Number(amount).toLocaleString("en-US")} has been allocated to{" "}
        {project.name}. A confirmation has been sent to your inbox.
      </Text>

      <View style={{ marginTop: 36 }}>
        <Eyebrow style={{ marginBottom: 10 }}>Reference</Eyebrow>
        <Text style={{ fontFamily: FONT.mono, fontSize: 13, letterSpacing: 0.7, color: ink }}>
          {ref}
        </Text>
      </View>
    </View>
  );
};
