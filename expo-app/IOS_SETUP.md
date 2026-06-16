# Everyday iOS Shell

This Expo app wraps the existing Everyday web product from `next-pwa` in a
native iOS container using `react-native-webview`. That keeps the product source
of truth in one place while giving you an installable iOS app path.

## Local iPhone Testing

Start the web product:

```bash
cd ../next-pwa
npm install
npm run dev
```

Start Expo:

```bash
cd ../expo-app
npm install
npm start
```

Scan the QR code with Expo Go. The shell infers the LAN host from Expo and opens:

```text
http://<your-lan-ip>:3000/legacy/Everyday.html?app=1
```

If your phone cannot reach the app, make sure both devices are on the same Wi-Fi
and that the Next dev server is allowed through Windows Firewall.

## Production URL

For TestFlight or App Store builds, point the native shell at the deployed web
app before building:

```powershell
$env:EXPO_PUBLIC_EVERYDAY_APP_URL="https://your-domain.example"
npm run build:ios -- --profile preview
```

If the value includes `/legacy/Everyday.html`, it is used as-is. If you provide
only the origin, the shell appends `/legacy/Everyday.html?app=1`.

## iOS Builds From Windows

Windows cannot compile iOS locally. Use Expo Application Services:

```bash
npx eas-cli init
npm run build:ios -- --profile preview
npm run build:ios -- --profile production
```

The current bundle identifier is `com.everydayjoe.app`; update `app.json` before
submission if your Apple Developer account uses a different registered id.
