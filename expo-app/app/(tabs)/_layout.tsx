// Two-tab bottom bar — Capital and Venture. Matches the wireframe's TabBar
// component, but uses the real expo-router Tabs so the OS-level back gesture,
// state preservation, and accessibility focus work natively.

import React from "react";
import { Tabs } from "expo-router";
import { View, Text, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ink, ink12, ink40, paper, FONT } from "../../src/theme/tokens";
import { useAccent } from "../../src/theme/accent";

export default function TabLayout() {
  const { accent } = useAccent();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // we render our own bar below
      }}
      tabBar={(props) => {
        const { state, navigation } = props;
        return (
          <View style={{
            borderTopWidth: 1, borderTopColor: ink12,
            backgroundColor: paper,
            paddingBottom: Math.max(insets.bottom, 12),
            flexDirection: "row",
          }}>
            {state.routes.map((route, i) => {
              const focused = state.index === i;
              const label = route.name === "capital" ? "Capital" : "Venture";
              return (
                <Pressable
                  key={route.key}
                  onPress={() => {
                    const event = navigation.emit({
                      type: "tabPress",
                      target: route.key,
                      canPreventDefault: true,
                    });
                    if (!focused && !event.defaultPrevented) {
                      navigation.navigate(route.name as never);
                    }
                  }}
                  accessibilityRole="button"
                  accessibilityState={focused ? { selected: true } : {}}
                  style={{ flex: 1, paddingVertical: 14, alignItems: "center" }}
                >
                  <Text style={{
                    fontFamily: FONT.bodyMedium, fontSize: 13,
                    color: focused ? ink : ink40, letterSpacing: 0.2,
                  }}>{label}</Text>
                  <View style={{
                    marginTop: 6, height: 2, width: 28,
                    backgroundColor: focused ? accent : "transparent",
                  }} />
                </Pressable>
              );
            })}
          </View>
        );
      }}
    >
      <Tabs.Screen name="capital" />
      <Tabs.Screen name="venture" />
    </Tabs>
  );
}
