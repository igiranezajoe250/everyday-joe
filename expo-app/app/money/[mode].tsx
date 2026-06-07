// Add money / Move funds / Withdraw — same flow shell, three modes.
// Mirrors MoneyFlowScreen in the wireframe.

import React, { useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  Eyebrow, ScreenHeader, BackBtn, CCButton, RoundedCard, NumericKeypad,
} from "../../src/components/primitives";
import { CheckBig } from "../../src/components/icons";
import {
  PK_DEPOSIT_SOURCES, PK_FUNDS_PICKER, PK_DESTINATIONS, PK_MANDATE_TARGETS,
} from "../../src/data/mock";
import { ink, ink12, ink25, ink55, ink70, paper, FONT, RADIUS } from "../../src/theme/tokens";
import { useAccent } from "../../src/theme/accent";

type Mode = "add" | "move" | "withdraw";

type PickerKind = "source" | "fund" | "destination" | "mandate";
type Picker = { kind: PickerKind; label: string };
type FlowConfig = {
  title: string;
  steps: string[];
  pickers: Record<number, Picker | undefined>;
  finalCta: string;
  doneTitle: string;
  doneSub: (amount: number) => string;
};

const CONFIGS: Record<Mode, FlowConfig> = {
  add: {
    title: "Add money",
    steps: ["Amount", "From", "Where", "Review", "Done"],
    pickers: {
      1: { kind: "source", label: "Funding source" },
      2: { kind: "mandate", label: "Allocate to" },
    },
    finalCta: "Confirm deposit",
    doneTitle: "Money added.",
    doneSub: (amt) =>
      `RWF ${amt.toLocaleString("en-US")} added to your wallet. Funds available immediately.`,
  },
  move: {
    title: "Move funds",
    steps: ["Amount", "From", "To", "Review", "Done"],
    pickers: {
      1: { kind: "fund", label: "Move from" },
      2: { kind: "fund", label: "Move to" },
    },
    finalCta: "Confirm move",
    doneTitle: "Funds moved.",
    doneSub: (amt) =>
      `RWF ${amt.toLocaleString("en-US")} reallocated between your funds.`,
  },
  withdraw: {
    title: "Withdraw",
    steps: ["Amount", "To", "Review", "Done"],
    pickers: { 1: { kind: "destination", label: "Destination" } },
    finalCta: "Confirm withdrawal",
    doneTitle: "Withdrawal initiated.",
    doneSub: (amt) =>
      `RWF ${amt.toLocaleString("en-US")} is on its way. It will arrive in your selected account within 1–2 business days.`,
  },
};

const optionsFor = (kind: PickerKind) =>
  kind === "source" ? PK_DEPOSIT_SOURCES :
  kind === "fund" ? PK_FUNDS_PICKER :
  kind === "destination" ? PK_DESTINATIONS :
  PK_MANDATE_TARGETS;

export default function MoneyFlowScreen() {
  const { mode } = useLocalSearchParams<{ mode: Mode }>();
  const router = useRouter();
  const { accent } = useAccent();
  const cfg = CONFIGS[mode] || CONFIGS.add;

  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState(0);
  const [picks, setPicks] = useState<Record<number, string>>({});

  const stepName = cfg.steps[step];
  const isLastInput = step === cfg.steps.length - 2;

  const blocked = useMemo(() => {
    if (stepName === "Amount") return amount <= 0;
    const p = cfg.pickers[step];
    if (p) return !picks[step];
    return false;
  }, [stepName, amount, picks, step, cfg]);

  const next = () => {
    Haptics.selectionAsync().catch(() => undefined);
    setStep((s) => Math.min(cfg.steps.length - 1, s + 1));
  };
  const back = () => {
    if (step === 0) router.back();
    else setStep((s) => s - 1);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: paper }}>
      <ScreenHeader
        left={<BackBtn onPress={back} />}
        right={
          <Text style={{
            fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1.2,
            textTransform: "uppercase", color: ink70,
          }}>{step + 1} / {cfg.steps.length}</Text>
        }
      />

      <View style={{
        marginHorizontal: 24, marginTop: 14,
        height: 3, backgroundColor: ink12, borderRadius: 999,
      }}>
        <View style={{
          height: 3, borderRadius: 999, backgroundColor: accent,
          width: `${((step + 1) / cfg.steps.length) * 100}%`,
        }} />
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 28, paddingBottom: 20 }}
        style={{ flex: 1 }}>
        {stepName === "Amount" ? (
          <AmountStep title={cfg.title} amount={amount} setAmount={setAmount} />
        ) : null}
        {stepName !== "Amount" && stepName !== "Review" && stepName !== "Done" ? (
          <PickerStep
            picker={cfg.pickers[step]!}
            value={picks[step]}
            onChange={(id) => setPicks((p) => ({ ...p, [step]: id }))}
          />
        ) : null}
        {stepName === "Review" ? (
          <ReviewStep cfg={cfg} amount={amount} picks={picks} />
        ) : null}
        {stepName === "Done" ? (
          <DoneStep cfg={cfg} amount={amount} />
        ) : null}
      </ScrollView>

      <View style={{
        backgroundColor: paper, borderTopWidth: 1, borderTopColor: ink12,
        paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
      }}>
        {stepName === "Done" ? (
          <CCButton variant="solid" accent={accent} fullWidth
            onPress={() => router.replace("/(tabs)/capital")}>
            Back to Capital
          </CCButton>
        ) : (
          <CCButton variant="solid" accent={accent} fullWidth
            disabled={blocked} onPress={next}>
            {isLastInput ? cfg.finalCta : "Continue"}
          </CCButton>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─────── Amount input ───────

const AmountStep = ({
  title, amount, setAmount,
}: { title: string; amount: number; setAmount: (n: number) => void }) => {
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
      <View style={{ alignItems: "center", paddingBottom: 24 }}>
        <Eyebrow style={{ marginBottom: 10 }}>{title}</Eyebrow>
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
      </View>

      <NumericKeypad onPress={onKey} />
    </View>
  );
};

// ─────── Picker step (radio list) ───────

const PickerStep = ({
  picker, value, onChange,
}: { picker: Picker; value?: string; onChange: (id: string) => void }) => {
  const options = optionsFor(picker.kind);
  return (
    <View>
      <Eyebrow style={{ marginBottom: 14 }}>{picker.label}</Eyebrow>
      <View style={{ gap: 10 }}>
        {options.map((o) => {
          const on = value === o.id;
          return (
            <Pressable key={o.id} onPress={() => onChange(o.id)}
              style={{
                flexDirection: "row", justifyContent: "space-between",
                alignItems: "center",
                padding: 18, borderRadius: RADIUS.md,
                borderWidth: on ? 2 : 1, borderColor: on ? ink : ink12,
                backgroundColor: paper,
              }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT.bodyMedium, fontSize: 15, color: ink }}>
                  {o.label}
                </Text>
                <Text style={{
                  fontFamily: FONT.body, fontSize: 12, color: ink55,
                  marginTop: 6, lineHeight: 18,
                }}>{o.sub}</Text>
              </View>
              <View style={{
                width: 22, height: 22, borderRadius: 11,
                borderWidth: 1, borderColor: on ? ink : ink25,
                alignItems: "center", justifyContent: "center", marginLeft: 12,
              }}>
                {on ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: ink }} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

// ─────── Review ───────

const ReviewStep = ({
  cfg, amount, picks,
}: { cfg: FlowConfig; amount: number; picks: Record<number, string> }) => {
  const rows: [string, string][] = [["Amount", "RWF " + Number(amount).toLocaleString("en-US")]];
  Object.entries(cfg.pickers).forEach(([idx, p]) => {
    if (!p) return;
    const id = picks[Number(idx)];
    const opt = optionsFor(p.kind).find((o) => o.id === id);
    rows.push([p.label, opt?.label || "—"]);
  });
  rows.push(["Fee", "Waived"]);

  return (
    <View>
      <Eyebrow style={{ marginBottom: 8 }}>Review</Eyebrow>
      <Text style={{
        fontFamily: FONT.displaySemi, fontSize: 28, letterSpacing: -0.6,
        lineHeight: 32, marginBottom: 32, color: ink,
      }}>Confirm your {cfg.title.toLowerCase()}.</Text>

      <RoundedCard padding={0} radius={RADIUS.lg}>
        {rows.map(([k, val], i) => {
          const isMono = /RWF|Waived/.test(val);
          return (
            <View key={k + i} style={{
              flexDirection: "row", justifyContent: "space-between",
              alignItems: "flex-end",
              paddingHorizontal: 20, paddingVertical: 16,
              borderBottomWidth: i < rows.length - 1 ? 1 : 0,
              borderBottomColor: ink12,
            }}>
              <Text style={{ fontFamily: FONT.body, fontSize: 13, color: ink55 }}>{k}</Text>
              <Text style={{
                fontFamily: isMono ? FONT.mono : FONT.body, fontSize: 14, color: ink,
                letterSpacing: isMono ? 0.3 : 0, maxWidth: "65%", textAlign: "right",
              }}>{val}</Text>
            </View>
          );
        })}
      </RoundedCard>
    </View>
  );
};

// ─────── Done ───────

const DoneStep = ({ cfg, amount }: { cfg: FlowConfig; amount: number }) => (
  <View style={{ paddingTop: 8 }}>
    <View style={{
      width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: ink,
      alignItems: "center", justifyContent: "center", marginBottom: 32,
    }}>
      <CheckBig />
    </View>
    <Text style={{
      fontFamily: FONT.displaySemi, fontSize: 32, letterSpacing: -0.8,
      lineHeight: 36, maxWidth: 300, color: ink,
    }}>{cfg.doneTitle}</Text>
    <Text style={{
      fontFamily: FONT.body, fontSize: 15, color: ink70, marginTop: 16, lineHeight: 23,
    }}>{cfg.doneSub(amount)}</Text>
  </View>
);
