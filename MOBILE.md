# CAFM PRO Mobile Testing

This repo now includes Capacitor mobile projects for Android and iOS.

The mobile app is a native WebView shell for the deployed CAFM PRO web app. The Next.js/Prisma server still runs on your hosting server; the phone app opens that hosted URL.

## Files Added

- `capacitor.config.ts` - Capacitor app configuration.
- `mobile-shell/index.html` - first-run mobile screen where testers enter the CAFM web app URL.
- `android/` - Android Studio project.
- `ios/` - Xcode iOS project.

## Test URL

Use your deployed CAFM URL in the mobile app, for example:

```text
https://your-cafm-domain.com
```

For Android emulator only, local testing can use:

```text
http://10.0.2.2:3003
```

For a real phone on the same Wi-Fi network, use your computer or server IP:

```text
http://YOUR-PC-IP:3003
```

HTTPS is recommended before production or App Store submission.

## Android

Install Android Studio with:

- Android SDK Platform 36
- Android SDK Build Tools
- Android Emulator or a connected Android phone

Then run:

```bash
npm install
npm run mobile:sync
npm run mobile:open:android
```

In Android Studio:

1. Let Gradle sync finish.
2. Select a device or emulator.
3. Press Run.

To build a debug APK from terminal:

```bash
npm run mobile:build:android
```

The debug APK will be created at:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## iOS

iOS must be built on macOS with Xcode.

On a Mac:

```bash
npm install
npm run mobile:sync
npm run mobile:open:ios
```

Then use Xcode to set the Apple developer team and run on a simulator/device, or archive for TestFlight.

## Updating the Mobile Shell

After changing `mobile-shell/index.html` or `capacitor.config.ts`, run:

```bash
npm run mobile:sync
```
