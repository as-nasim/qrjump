# QRJump — Universal QR Scanner App

A React Native app that scans any QR code and **jumps directly into the right app** — no detours through payment menus or browser redirects.

---

## What It Does

| Scan this QR code | QRJump does this |
|---|---|
| bKash payment QR | Opens bKash directly on the payment screen |
| Nagad QR | Opens Nagad payment flow |
| Rocket QR | Opens Rocket payment |
| WhatsApp link | Opens the WhatsApp chat directly |
| YouTube link | Opens video in YouTube app |
| Wi-Fi QR | Shows network name + password |
| Contact vCard | Offers to save the contact |
| Any website | Opens in browser |
| Phone / email / SMS | Opens dialer / mail / SMS |

---

## Supported Apps (Bangladesh Focus)

### Payments
- **bKash** — `bkash://`
- **Nagad** — `nagad://`
- **Rocket (DBBL)** — `rocket://`
- **Upay (UCBL)** — `upay://`
- **SureCash** — `surecash://`
- **Paytm** — `paytm://`
- **UPI (GPay, PhonePe, BHIM)** — `upi:`
- **PayPal** — `paypal://`

### Social / Messaging
- WhatsApp, Telegram, Instagram, Facebook, YouTube

### Transport / Shopping
- Pathao, Shohoz, Uber, Daraz

---

## Project Structure

```
QRJump/
├── App.tsx                    # Navigation root
├── src/
│   ├── screens/
│   │   ├── ScannerScreen.tsx  # Camera + QR detection
│   │   ├── ResultScreen.tsx   # Shows detected app + open button
│   │   ├── HistoryScreen.tsx  # Past scans
│   │   └── PermissionScreen.tsx
│   ├── components/
│   │   └── ScanFrame.tsx      # Animated corner brackets
│   └── utils/
│       ├── appRouter.ts       # QR → app detection logic
│       └── deepLink.ts        # Linking.openURL wrapper
├── android/
│   └── app/src/main/AndroidManifest.xml  # Permissions + queries
└── ios/
    └── QRJump/Info.plist      # Camera + URL scheme whitelist
```

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- React Native CLI (not Expo)
- Android Studio (for Android)
- Xcode 14+ (for iOS, Mac only)
- JDK 17

### 1. Install dependencies
```bash
cd QRJump
npm install
```

### 2. iOS only — install pods
```bash
cd ios && pod install && cd ..
```

### 3. Run on Android
```bash
npm run android
```

### 4. Run on iOS
```bash
npm run ios
```

---

## Adding More Apps

To add a new payment app or service, open `src/utils/appRouter.ts` and add a new rule in the `APP_RULES` array:

```typescript
{
  test: (d) => /yourapp/i.test(d) || d.startsWith('yourapp://'),
  route: (d) => ({
    appName: 'Your App',
    appId: 'yourapp',
    deepLink: d.startsWith('yourapp://') ? d : `yourapp://pay?data=${encodeURIComponent(d)}`,
    fallbackUrl: 'https://yourapp.com',
    icon: '💰',
    color: '#FF0000',
    category: 'payment',
    action: 'Pay with Your App',
  }),
},
```

Then add the scheme to:
- **Android:** `android/app/src/main/AndroidManifest.xml` → `<queries>` block
- **iOS:** `ios/QRJump/Info.plist` → `LSApplicationQueriesSchemes` array

---

## How Deep Linking Works

```
User scans QR
     ↓
detectApp(rawString)        ← appRouter.ts matches pattern
     ↓
returns { deepLink, appName, color, action, ... }
     ↓
openDeepLink(result)        ← deepLink.ts
     ↓
Linking.canOpenURL(deepLink)
     ↓
  ┌─────────────────────────────────┐
  │ App installed?                  │
  │  YES → Linking.openURL(deepLink)│  ← Opens bKash payment screen
  │   NO → Offer Play/App Store     │
  └─────────────────────────────────┘
```

---

## Key Libraries

| Library | Purpose |
|---|---|
| `react-native-vision-camera` | High-performance camera |
| `vision-camera-code-scanner` | QR/barcode reading via MLKit |
| `@react-navigation/native` | Screen navigation |
| `react-native-reanimated` | Smooth animations |
| `react-native-svg` | Corner frame SVG |
| `@react-native-async-storage/async-storage` | Scan history |

---

## Permissions

### Android
- `CAMERA` — required for scanning
- `FLASHLIGHT` — torch toggle
- `INTERNET` — fallback URLs

### iOS
- `NSCameraUsageDescription` — camera access prompt
- `LSApplicationQueriesSchemes` — declares which URL schemes can be opened

---

## Publish Checklist

- [ ] Change app name/bundle ID in `package.json`, `AndroidManifest.xml`, and Xcode
- [ ] Add real app icon (`android/app/src/main/res/mipmap-*/` and Xcode assets)
- [ ] Set up signing certificates (Android keystore, iOS provisioning profile)
- [ ] Test on real devices — camera and deep links don't work in simulators
- [ ] Add any regional payment apps relevant to your market
- [ ] Review Play Store / App Store guidelines for scanner apps
