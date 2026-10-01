# MISE Project Guide

MISE is an Expo / React Native health and food planning demo. It uses an editorial food-journal design and presents sample daily menus alongside an optional account and wearable data flow.

## What is built

- Six Expo Router tabs: Today, Vitals, Discover, Plan, List, and You.
- MISE welcome and account screens, with Back4App email/password sign-up, sign-in, persistent sessions, password reset, sign-out, and account deletion.
- New demo accounts store clearly identified, fictional sample profile fields in the Back4App `_User` row: age, sex, weight, a disconnected example watch, food preferences, and a step goal.
- Vitals shows illustrative readings. They are separate from real Apple Health data and are labeled as samples.
- Recipe feedback, a sample meal plan, a sample grocery list, and saving a recipe are currently local demo state.
- An Apple Health connection panel reads steps, resting heart rate, and sleep on a compatible iPhone build. The user starts each sync manually; the app stores a summary on the user's private Back4App record. It does not upload raw HealthKit samples or write data to Apple Health.
- Basic iOS and web bundling, lint, and TypeScript support.

## Screen map

| Route | Purpose |
| --- | --- |
| `/` | Welcome, account flow, or Today dashboard |
| `/vitals` | Sample metrics plus Apple Health connection and saved readings |
| `/explore` | Sample recipes and discovery |
| `/plan` | Example daily meal plan |
| `/list` | Example grocery list |
| `/account` | Saved profile, sample onboarding data, sign-out and deletion |

Shared MISE typography, colors, page layout, and actions live in `src/components/mise.tsx`; tab navigation is in `src/components/mise-tabs.tsx`.

## Stack

- Expo SDK 57, React Native 0.86, React 19, TypeScript, Expo Router.
- Parse JavaScript SDK connected to Back4App for users, session persistence, profile fields, password reset, and saved health summaries.
- `@kingstinct/react-native-healthkit` for native HealthKit access. Its Expo config plugin enables the HealthKit capability and a read-purpose string. `expo-dev-client` and Nitro are installed for development builds.
- A small Metro resolver maps the Parse SDK's React Native `crypto.randomUUID` dependency to Expo Crypto.
- No separate server, SQL database, paid wearable aggregator, or WHOOP OAuth connection is configured.

## Back4App data model

### `_User`

Parse Server's built-in user class stores username/email, the password hash, session token, and these app fields:

| Field | Meaning |
| --- | --- |
| `displayName` | Name entered on sign-up |
| `goalSteps` | Demo default of 10,000 |
| `age`, `sex`, `weightKg` | Fictional defaults: 24, `female`, 65 |
| `device` | Fictional Apple Watch Series 9 descriptor; `isConnected` is `false` |
| `preferences` | Fictional diet, cuisines, dislikes, budget, cook time, spice, and goals |
| `profileDataSource`, `demoProfileVersion` | Identifies and versions the sample data |
| `healthSnapshot` | Optional manually synced HealthKit summary, separate from fictional fields |

New user and sample-profile fields are submitted as one sign-up request. The app never infers these fictional values from the real user's name or email. Sign-in does not rewrite them. Existing accounts do not get sample fields automatically. New users have no public ACL permissions; the live integration check confirmed public read/write are disabled. App-specific data is stored on `_User`, so account deletion also deletes this profile and health summary.

### Health summary

`healthSnapshot` contains the provider, sync time, current-day start, sleep window start, steps, selected step source, most recent resting-heart-rate sample, sleep duration, and source names. A sync replaces the previous summary. The app checks the current user ID before saving, and the account SDK test checked that a mismatched user ID is rejected.

## Apple Watch and other wearables

Apple Health is the free aggregation point for Apple Watch and third-party apps that share data into Apple Health. Users can enable WHOOP → Apple Health sharing in the WHOOP app, after which MISE can read the supported data that appears in Apple Health. This does **not** connect to WHOOP's developer API and does not provide WHOOP-only strain, recovery, or other proprietary scores unless those values are available through Apple Health.

MISE currently requests read access to:

- Step count, for today.
- Resting heart rate, using the latest sample in the preceding 24 hours.
- Sleep analysis, merging overlapping asleep intervals in the preceding 24 hours and omitting awake/in-bed intervals.

The step summary selects the single source with the highest daily total; it does not add separate watch, phone, and other device totals together. Apple Health source selection may differ. If a metric is missing or access is denied, MISE leaves it unavailable rather than inventing a value. Apple does not tell an app whether read access was denied. Data refresh is manual; no background HealthKit delivery is configured.

### Important build constraint

Expo Go does not include HealthKit. Continue to use Expo Go for the demo, but install an iOS development build to access actual Apple Health data. Generated `ios/` and `android/` projects are intentionally not committed; Expo config and autolinking generate native projects.

This Mac currently has Command Line Tools but no full Xcode (`xcodebuild` is unavailable). Local `npx expo run:ios --device` therefore cannot build here until Xcode is installed. A device build also requires suitable Apple signing. The optional [EAS setup](WEARABLE_SETUP.md) may require an Expo account and Apple Developer Program membership. No build or distribution has been submitted.

## Run the project

```bash
npm install
npx expo start --go --tunnel
```

Expo Go can open the sample app and Back4App account flow. Vitals shows the Apple Health integration instructions, while HealthKit reading is unavailable inside Expo Go.

For an installed development client after configuring signing and EAS environment values:

```bash
npx eas-cli@latest build --platform ios --profile development
npx expo start --dev-client --tunnel
```

See [WEARABLE_SETUP.md](WEARABLE_SETUP.md) before building.

## Back4App configuration

The client needs the Application ID and JavaScript Key. The app ID is in `.env.example`; place the JavaScript Key in an ignored `.env.local` file:

```env
EXPO_PUBLIC_BACK4APP_APP_ID=your-application-id
EXPO_PUBLIC_BACK4APP_JAVASCRIPT_KEY=your-javascript-key
```

The Master Key must never be placed in the mobile app or repository. Client-side Back4App keys ship in the app; protect user data with Parse ACLs and class-level permissions. Review `_User` permissions in Back4App. See [BACKEND_SETUP.md](BACKEND_SETUP.md).

## Files and ownership

- `src/app/`: Expo Router screens.
- `src/components/`: shared UI and account/health panels.
- `src/lib/back4app.ts`: Parse setup.
- `src/lib/account.ts`: Back4App sign-up, sign-in, session profile, password reset, and account deletion.
- `src/lib/health-account.ts`: private per-user health summary save/load/remove.
- `src/lib/demo-profile.ts`: fictional signup defaults.
- `src/lib/health-data.ts`: HealthKit summary type and sleep-interval aggregation.
- `src/services/apple-health.ios.ts`: iOS permission request and read-only HealthKit queries.
- `src/services/apple-health.ts`: platform fallback for Android and web.
- `app.json`: Expo app identity, HealthKit plugin and permission description.
- `eas.json`: internal iOS development build profile.
- `BACKEND_SETUP.md`: Back4App project steps and profile-field reference.
- `WEARABLE_SETUP.md`: device build and HealthKit setup.
- `privacy-policy.html`: starting template; update owner contact details and hosting before using it publicly.

## Current limitations

- No live wearable access while running in Expo Go; requires a signed iPhone development build and HealthKit permission grant.
- Actual native compilation and real-device HealthKit reads remain unverified because Xcode is not installed on the current Mac.
- WHOOP is only indirectly supported through data WHOOP writes to Apple Health; there is no WHOOP OAuth, webhook, or API integration.
- Age, sex, weight, device, preferences, and recommendations are sample data. Users do not yet have editable preferences or health-profile onboarding.
- Only an explicit sync sends a health summary to Back4App. No recipes, meal feedback, shopping-list selections, or meal plan are persisted to the backend.
- Privacy policy still needs real owner contact details and public hosting. App Store disclosures, consent review, and production readiness are unfinished.

## Checks already performed

- `npx tsc --noEmit` and `npx expo lint` passed after the Apple Health changes.
- Expo iOS and web exports completed, and Expo config introspection confirmed the HealthKit entitlement and read-purpose text.
- A live Back4App disposable-account check verified signup, login, profile fields, private ACL, health-summary save/read/remove, account mismatch protection, and deletion; the test account was deleted afterward.
- Sleep summary checks covered overlapping stages, gaps, window boundaries, and missing sleep samples.
- Apple Health permissions and watch reads have not been device-tested yet.
