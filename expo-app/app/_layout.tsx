// Root layout. Loads custom fonts, holds the splash screen until they are
// ready, wires up the global Accent + SafeArea + GestureHandler providers,
// and renders an expo-router Stack. Every screen is registered here so back
// navigation, deep links (crownedcrane://), and the iOS swipe-back gesture
// just work.

import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { useAppFonts } from "../src/theme/fonts";
import { AccentProvider } from "../src/theme/accent";
import { canvas } from "../src/theme/tokens";

SplashScreen.preventAutoHideAsync().catch(() => {/* already hidden */});

export default function RootLayout() {
  const fontsLoaded = useAppFonts();

  React.useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => undefined);
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // Holding the splash here keeps the first paint from flashing system fonts.
    return <View style={{ flex: 1, backgroundColor: canvas }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AccentProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#fff" },
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="venture/[id]/index" />
            <Stack.Screen name="venture/[id]/ops/[step]" />
            <Stack.Screen name="checkout/[id]" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="money/[mode]" options={{ animation: "slide_from_bottom" }} />
            <Stack.Screen name="wallet" />
            <Stack.Screen name="settings" />
          </Stack>
        </AccentProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
