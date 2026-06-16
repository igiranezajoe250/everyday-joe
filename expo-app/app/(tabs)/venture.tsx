// Project feed — one flat list of investable projects. Tapping a row opens
// the project detail.

import React, { useMemo, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Eyebrow, ScreenHeader, IconBtn, StripePlaceholder,
} from "../../src/components/primitives";
import { SortIcon, SearchIcon, ChevronRight, CheckIcon } from "../../src/components/icons";
import { PK_PROJECTS, type Project } from "../../src/data/mock";
import { ink, ink06, ink12, ink25, ink40, ink55, ink70, paper, FONT, RADIUS } from "../../src/theme/tokens";

type SortId = "recent" | "yield" | "name";
const SORTS: { id: SortId; label: string }[] = [
  { id: "recent", label: "Most recent" },
  { id: "yield", label: "Highest projected yield" },
  { id: "name", label: "Name · A–Z" },
];

const yieldNum = (p: Project): number => {
  const src = p.yieldHero || p.yieldRange || "";
  const m = src.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
};

const STATUS_LABEL: Record<Project["status"], string> = {
  "open": "Open",
  "closing-soon": "Closing soon",
  "waitlist": "Waitlist",
};

export default function VentureFeedScreen() {
  const router = useRouter();
  const [sort, setSort] = useState<SortId>("recent");
  const [sortOpen, setSortOpen] = useState(false);

  const list = useMemo(() => {
    return [...PK_PROJECTS].sort((a, b) =>
      sort === "yield" ? yieldNum(b) - yieldNum(a) :
      sort === "name" ? a.name.localeCompare(b.name) :
      0
    );
  }, [sort]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: paper }}>
      <ScreenHeader
        left={<Eyebrow>Projects</Eyebrow>}
        right={
          <IconBtn onPress={() => setSortOpen(true)}>
            <SortIcon />
          </IconBtn>
        }
      />

      <FlatList
        data={list}
        keyExtractor={(v) => v.id}
        ListHeaderComponent={
          <View>
            <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 6 }}>
              <Text style={{
                fontFamily: FONT.displaySemi, fontSize: 32,
                letterSpacing: -0.8, color: ink, lineHeight: 36,
              }}>Live projects</Text>
              <Text style={{
                fontFamily: FONT.body, fontSize: 13, color: ink70,
                marginTop: 8, lineHeight: 18,
              }}>Businesses Everyday is helping grow — invest directly from your wallet.</Text>
            </View>

            <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 }}>
              <View style={{
                height: 48, paddingHorizontal: 18, borderRadius: RADIUS.pill,
                backgroundColor: "#F2F2F2",
                flexDirection: "row", alignItems: "center", gap: 10,
              }}>
                <View style={{ opacity: 0.45 }}><SearchIcon /></View>
                <Text style={{ fontFamily: FONT.body, fontSize: 14, color: ink40 }}>
                  Search
                </Text>
              </View>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <Row
            v={item}
            last={index === list.length - 1}
            onPress={() => router.push(`/venture/${item.id}`)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      {/* Sort sheet */}
      {sortOpen ? (
        <Pressable
          onPress={() => setSortOpen(false)}
          style={{
            position: "absolute",
            top: 0, bottom: 0, left: 0, right: 0,
            backgroundColor: "rgba(0,0,0,0.16)",
            justifyContent: "flex-end",
          }}>
          <Pressable onPress={() => undefined}
            style={{
              backgroundColor: paper,
              borderTopLeftRadius: 24, borderTopRightRadius: 24,
              paddingTop: 12, paddingBottom: 32,
            }}>
            <View style={{
              alignSelf: "center", width: 36, height: 4,
              borderRadius: 2, backgroundColor: ink12, marginBottom: 12,
            }} />
            <View style={{ paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8 }}>
              <Eyebrow>Sort by</Eyebrow>
            </View>
            {SORTS.map((o) => {
              const on = sort === o.id;
              return (
                <Pressable key={o.id} onPress={() => { setSort(o.id); setSortOpen(false); }}
                  style={{
                    flexDirection: "row", justifyContent: "space-between",
                    alignItems: "center",
                    paddingHorizontal: 20, paddingVertical: 14,
                  }}>
                  <Text style={{ fontFamily: FONT.body, fontSize: 15, color: ink }}>
                    {o.label}
                  </Text>
                  {on ? <CheckIcon /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

const Row = ({
  v, last, onPress,
}: { v: Project; last: boolean; onPress: () => void }) => {
  const sub = `${v.sector} · ${v.location.split(",")[0]}`;
  return (
    <Pressable onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: "row", alignItems: "center", gap: 14,
        paddingVertical: 14, marginHorizontal: 20,
        borderBottomWidth: last ? 0 : 1, borderBottomColor: ink06,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <StripePlaceholder width={48} height={48} radius={12} />
      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={{
          fontFamily: FONT.bodyMedium, fontSize: 15, color: ink,
        }}>{v.name}</Text>
        <Text numberOfLines={1} style={{
          fontFamily: FONT.mono, fontSize: 10, letterSpacing: 0.8,
          textTransform: "uppercase", color: ink55, marginTop: 4,
        }}>{sub}</Text>
      </View>
      <View style={{ alignItems: "flex-end", marginRight: 6 }}>
        <Text style={{
          fontFamily: FONT.displaySemi, fontSize: 16, color: ink, letterSpacing: -0.2,
        }}>{v.yieldHero}</Text>
        <Text style={{
          fontFamily: FONT.mono, fontSize: 9, color: ink55,
          letterSpacing: 0.8, textTransform: "uppercase", marginTop: 2,
        }}>{STATUS_LABEL[v.status]}</Text>
      </View>
      <ChevronRight color={ink40} />
    </Pressable>
  );
};
