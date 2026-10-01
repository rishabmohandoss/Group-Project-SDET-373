# MISE

An Expo demo app for food and wellness recommendations, with Back4App accounts and an optional Apple Health connection. The app runs in Expo Go as a demo; native HealthKit access requires an iPhone development build.

Start here: [MISE project guide](MISE_PROJECT_GUIDE.md). It documents the app, screens, Back4App schema, wearable data flow, privacy, setup, and current limitations.

## Run the demo

```bash
npm install
npx expo start --go --tunnel
```

Scan the QR code with Expo Go, or open `http://localhost:8081` on the development Mac. Choose **Preview demo without an account** to browse without signing in.

## Configure Back4App

Copy `.env.example` to `.env.local` and add your Back4App JavaScript Key. Do not add the Master Key. Restart Expo after editing environment values. Details are in [BACKEND_SETUP.md](BACKEND_SETUP.md).

## Apple Health

HealthKit is not included in Expo Go. Install an iPhone development build before attempting to connect a watch. See [WEARABLE_SETUP.md](WEARABLE_SETUP.md) for the free Apple Health integration, supported data, build requirements, and WHOOP sharing notes.
