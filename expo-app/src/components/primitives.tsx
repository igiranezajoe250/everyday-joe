// Cross-platform UI primitives. Mirrors the wireframe's ui.jsx but uses
// React Native components — <View>, <Text>, <Pressable> — and StyleSheet, so
// the same code runs on iOS, Android, and (via react-native-web) the web
// build that ships in Expo SDK 54.

import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { ink, ink06, ink12, ink25, ink40, ink55, ink70, paper, FONT, RADIUS } from "../theme/tokens";
import { ChevronLeft, PlusIcon } from "./icons";

// Enable the cross-platform LayoutAnimation API on Android (no-op on iOS).
// Used by <CollapsibleSection> to grow/shrink its body smoothly. Reanimated
// would be overkill for this.
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ───────── divider ─────────

export const Rule = ({
  color = ink12,
  style,
}: { color?: string; style?: StyleProp<ViewStyle> }) => (
  <View style={[{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: color }, style]} />
);

// ───────── eyebrow label ─────────

export const Eyebrow = ({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) => (
  <Text style={[styles.eyebrow, style]}>{children}</Text>
);

// ───────── stripe placeholder ─────────
// 45° hatch placeholder image. The web wireframe used a CSS
// repeating-linear-gradient, which RN doesn't support — we replace it with a
// stack of thin rotated lines that achieves the same effect cross-platform.
export const StripePlaceholder = ({
  width = 48 as number | string,
  height = 48,
  radius = RADIUS.md,
  label,
  dark = false,
  style,
}: {
  width?: number | string;
  height?: number;
  radius?: number;
  label?: string;
  dark?: boolean;
  style?: StyleProp<ViewStyle>;
}) => {
  const bg = dark ? "#111" : "#F2F2F2";
  const stripe = dark ? "rgba(255,255,255,0.07)" : "rgba(10,10,10,0.05)";
  // Build N parallel lines rotated 45deg to fake the gradient.
  const lineCount = 48;
  const spacing = 8;
  return (
    <View
      style={[
        { width: width as any, height, borderRadius: radius, backgroundColor: bg, overflow: "hidden" },
        style,
      ]}
    >
      {Array.from({ length: lineCount }).map((_, i) => (
        <View
          key={i}
          pointerEvents="none"
          style={{
            position: "absolute",
            top: -height,
            bottom: -height,
            left: i * spacing - lineCount * 2,
            width: 1,
            backgroundColor: stripe,
            transform: [{ rotate: "45deg" }],
          }}
        />
      ))}
      {label ? (
        <Text
          style={{
            position: "absolute",
            bottom: 8,
            left: 12,
            fontFamily: FONT.mono,
            fontSize: 10,
            letterSpacing: 0.8,
            color: dark ? "rgba(255,255,255,0.5)" : ink40,
            textTransform: "uppercase",
          }}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
};

// ───────── status pill ─────────

type PillVariant = "outline" | "solid" | "ghost";

export const StatusPill = ({
  children,
  variant = "outline",
  accent,
}: { children: React.ReactNode; variant?: PillVariant; accent?: string }) => {
  const v =
    variant === "outline" ? { bg: "transparent", color: ink, border: ink } :
    variant === "solid" ? { bg: accent || ink, color: "#fff", border: accent || ink } :
    { bg: "transparent", color: ink55, border: ink25 };
  return (
    <View style={{
      alignSelf: "flex-start",
      paddingHorizontal: 12,
      height: 24,
      borderRadius: RADIUS.pill,
      backgroundColor: v.bg,
      borderWidth: 1,
      borderColor: v.border,
      justifyContent: "center",
    }}>
      <Text style={{
        fontFamily: FONT.mono, fontSize: 10, letterSpacing: 1.2,
        textTransform: "uppercase", color: v.color,
      }}>{children}</Text>
    </View>
  );
};

// ───────── rounded card ─────────

export const RoundedCard = ({
  children, padding = 20, radius = RADIUS.lg, style,
}: {
  children: React.ReactNode;
  padding?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) => (
  <View style={[{
    borderWidth: 1, borderColor: ink12, borderRadius: radius,
    padding, backgroundColor: paper,
  }, style]}>
    {children}
  </View>
);

// ───────── collapsible section ─────────

export const CollapsibleSection = ({
  title, meta, defaultOpen = false, padded = true, children,
}: {
  title: string;
  meta?: string;
  defaultOpen?: boolean;
  padded?: boolean;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen((o) => !o);
  };
  return (
    <View>
      <Pressable
        onPress={toggle}
        style={{
          paddingHorizontal: padded ? 24 : 0,
          paddingVertical: 22,
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Text style={styles.eyebrow}>{title}</Text>
          {meta ? <Text style={[styles.eyebrow, { color: ink25 }]}>· {meta}</Text> : null}
        </View>
        <View style={{
          width: 28, height: 28, borderRadius: 14,
          borderWidth: 1, borderColor: ink12, backgroundColor: paper,
          alignItems: "center", justifyContent: "center",
          transform: [{ rotate: open ? "45deg" : "0deg" }],
        }}>
          <PlusIcon />
        </View>
      </Pressable>
      {open ? (
        <View style={{ paddingHorizontal: padded ? 24 : 0, paddingBottom: 26 }}>
          {children}
        </View>
      ) : null}
    </View>
  );
};

// ───────── ScreenHeader / BackBtn / IconBtn / Avatar ─────────

export const ScreenHeader = ({
  left, right,
}: { left?: React.ReactNode; right?: React.ReactNode }) => (
  <View style={styles.header}>
    <View style={styles.headerSlot}>{left}</View>
    <View style={[styles.headerSlot, { flexDirection: "row", gap: 8 }]}>{right}</View>
  </View>
);

export const BackBtn = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back"
    style={styles.circleBtn}>
    <ChevronLeft />
  </Pressable>
);

export const IconBtn = ({
  children, onPress,
}: { children: React.ReactNode; onPress?: () => void }) => (
  <Pressable onPress={onPress} hitSlop={6} style={styles.circleBtn}>
    {children}
  </Pressable>
);

export const Avatar = ({ initials = "JK", size = 36 }: { initials?: string; size?: number }) => (
  <View style={{
    width: size, height: size, borderRadius: size / 2,
    borderWidth: 1, borderColor: ink25,
    alignItems: "center", justifyContent: "center",
  }}>
    <Text style={{ fontFamily: FONT.mono, fontSize: 10, letterSpacing: 0.6, color: ink70 }}>
      {initials}
    </Text>
  </View>
);

// ───────── primary / ghost / outline button ─────────

type ButtonSize = "lg" | "md" | "sm";

export const CCButton = ({
  children, onPress, variant = "outline", accent, size = "lg",
  fullWidth = false, disabled = false, style,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: "solid" | "outline" | "ghost";
  accent?: string;
  size?: ButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) => {
  const sizing =
    size === "lg" ? { h: 56, font: 15, pad: 24 } :
    size === "md" ? { h: 48, font: 14, pad: 20 } :
    { h: 40, font: 13, pad: 16 };
  const v =
    variant === "solid" ? { bg: accent || ink, color: "#fff", border: accent || ink } :
    variant === "outline" ? { bg: paper, color: ink, border: ink } :
    { bg: "transparent", color: ink, border: ink12 };
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [{
        height: sizing.h, paddingHorizontal: sizing.pad,
        borderRadius: RADIUS.pill, borderWidth: 1,
        borderColor: v.border, backgroundColor: v.bg,
        alignItems: "center", justifyContent: "center",
        width: fullWidth ? "100%" : undefined,
        opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
      }, style]}
    >
      <Text style={{
        fontFamily: FONT.bodyMedium, fontSize: sizing.font,
        color: v.color, letterSpacing: 0.1,
      }}>{children}</Text>
    </Pressable>
  );
};

// ───────── numeric keypad ─────────
// Cross-platform keypad. We render an explicit grid rather than relying on
// the OS keyboard so the amount-entry feels like a banking app on both
// platforms.

export const NumericKeypad = ({
  onPress,
}: { onPress: (key: string) => void }) => {
  const keys: string[] = ["1","2","3","4","5","6","7","8","9","00","0","back"];
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
      {keys.map((k) => (
        <Pressable
          key={k}
          onPress={() => onPress(k)}
          style={({ pressed }) => ({
            width: "33.3333%",
            height: 56,
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <Text style={{
            fontFamily: FONT.bodyMedium, fontSize: 22, color: ink,
            letterSpacing: 0.4,
          }}>
            {k === "back" ? "⌫" : k}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

// ───────── activity row / stat block ─────────

export const ActivityRow = ({
  title, amount, time, last,
}: { title: string; amount: string; time: string; last?: boolean }) => (
  <View style={{
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end",
    paddingVertical: 16,
    borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth, borderBottomColor: ink06,
  }}>
    <View>
      <Text style={{ fontFamily: FONT.body, fontSize: 14, color: ink }}>{title}</Text>
      <Text style={[styles.eyebrow, { marginTop: 4 }]}>{time}</Text>
    </View>
    <Text style={{ fontFamily: FONT.mono, fontSize: 13, color: ink }}>{amount}</Text>
  </View>
);

export const StatBlock = ({
  label, value, sub,
}: { label: string; value: string; sub?: string }) => (
  <View>
    <Eyebrow style={{ marginBottom: 8 }}>{label}</Eyebrow>
    <Text style={{
      fontFamily: FONT.displaySemi, fontSize: 24,
      letterSpacing: -0.4, color: ink,
    }}>{value}</Text>
    {sub ? <Eyebrow style={{ marginTop: 6 }}>{sub}</Eyebrow> : null}
  </View>
);

// ───────── allocation bar ─────────

export const AllocBar = ({
  label, percent, accent,
}: { label: string; percent: number; accent?: string }) => (
  <View style={{ paddingVertical: 14 }}>
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
      <Text style={{ fontFamily: FONT.body, fontSize: 14, color: ink }}>{label}</Text>
      <Text style={{ fontFamily: FONT.mono, fontSize: 13, color: ink }}>{percent}%</Text>
    </View>
    <View style={{ height: 2, backgroundColor: ink12 }}>
      <View style={{
        position: "absolute", top: 0, bottom: 0, left: 0,
        width: `${percent}%`, backgroundColor: accent || ink,
      }} />
    </View>
  </View>
);

// ───────── shared styles ─────────

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: FONT.mono,
    fontSize: 10,
    letterSpacing: 1.2,
    color: ink55,
    textTransform: "uppercase",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerSlot: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  circleBtn: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, borderColor: ink12, backgroundColor: paper,
    alignItems: "center", justifyContent: "center",
  },
});

export { styles as ccStyles };
