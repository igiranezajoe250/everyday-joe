import Constants from "expo-constants";
import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { canvas, FONT, ink, ink40, ink55, ink70, ink12, paper } from "../theme/tokens";

const DEFAULT_PATH = "/legacy/Everyday.html?app=1";
const LEGACY_PATH = "/legacy/" + "Poke" + "tee.html";

function normalizeEverydayUrl(value: string) {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (trimmed.includes("/legacy/Everyday.html") || trimmed.includes(LEGACY_PATH)) return trimmed;
  return `${trimmed}${DEFAULT_PATH}`;
}

function devServerUrl() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoClient?.hostUri;
  const host = hostUri?.split(":")[0];
  return host ? `http://${host}:3000${DEFAULT_PATH}` : `http://localhost:3000${DEFAULT_PATH}`;
}

function everydayUrl() {
  return normalizeEverydayUrl(process.env.EXPO_PUBLIC_EVERYDAY_APP_URL || "") || devServerUrl();
}

export function EverydayWebView() {
  const [url, setUrl] = React.useState(everydayUrl);
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const webViewRef = React.useRef<WebView>(null);

  const retry = () => {
    setError(null);
    setLoaded(false);
    webViewRef.current?.reload();
  };

  return (
    <SafeAreaView style={styles.shell} edges={["top", "bottom"]}>
      <WebView
        ref={webViewRef}
        source={{ uri: url }}
        style={styles.webView}
        originWhitelist={["http://*", "https://*"]}
        javaScriptEnabled
        domStorageEnabled
        sharedCookiesEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        pullToRefreshEnabled
        onLoadStart={() => {
          setLoaded(false);
          setError(null);
        }}
        onLoadEnd={() => setLoaded(true)}
        onError={(event) => setError(event.nativeEvent.description)}
        onHttpError={(event) => {
          if (event.nativeEvent.statusCode >= 400) {
            setError(`HTTP ${event.nativeEvent.statusCode}`);
          }
        }}
        onNavigationStateChange={(state) => {
          if (state.url && state.url !== url) setUrl(state.url);
        }}
      />

      {!loaded && !error ? (
        <View style={styles.overlay}>
          <ActivityIndicator color={ink} />
          <Text style={styles.eyebrow}>Everyday</Text>
          <Text style={styles.copy}>Opening your trusted daily app.</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.overlay}>
          <Text style={styles.eyebrow}>Connection</Text>
          <Text style={styles.title}>Everyday is not reachable.</Text>
          <Text style={styles.copy}>
            Start the web app with npm run dev in next-pwa, or set EXPO_PUBLIC_EVERYDAY_APP_URL
            to your deployed site before building.
          </Text>
          <Text style={styles.url}>{url}</Text>
          <Pressable accessibilityRole="button" onPress={retry} style={styles.button}>
            <Text style={styles.buttonText}>Try again</Text>
          </Pressable>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: canvas,
  },
  webView: {
    flex: 1,
    backgroundColor: canvas,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 28,
    backgroundColor: canvas,
  },
  eyebrow: {
    color: ink40,
    fontFamily: FONT.monoMedium,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    maxWidth: 320,
    color: ink,
    fontFamily: FONT.displaySemi,
    fontSize: 26,
    lineHeight: 31,
    textAlign: "center",
  },
  copy: {
    maxWidth: 330,
    color: ink70,
    fontFamily: FONT.body,
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },
  url: {
    maxWidth: 320,
    color: ink55,
    fontFamily: FONT.mono,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: ink12,
    paddingTop: 14,
  },
  button: {
    minHeight: 48,
    minWidth: 132,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: ink,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: paper,
    fontFamily: FONT.bodySemi,
    fontSize: 15,
  },
});
