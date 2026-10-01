# Apple Health connection

MISE uses the open-source HealthKit library directly, with no paid wearable aggregator. WHOOP and other apps can contribute supported data by exporting to Apple Health; this is not a direct WHOOP OAuth connection and does not include proprietary recovery/strain scores.

## Install on your iPhone

HealthKit is unavailable in Expo Go and browsers. Install an iPhone development build before attempting to sync. Full Xcode is not currently installed on this Mac.

Local route: install compatible Xcode, sign in to your Apple account, connect your iPhone, enable Developer Mode, then run `npx expo run:ios --device`. Signing must support the HealthKit entitlement; do not assume every Personal Team can provision every capability.

EAS route: with an Expo account and Apple Developer Program membership, configure the two EXPO_PUBLIC_BACK4APP variables in the EAS development environment (local `.env.local` is gitignored), then run `npx eas-cli@latest build --platform ios --profile development`. Install the resulting development build. This may involve membership or build costs; no paid service has been purchased or build submitted by this change.

Start Metro for the installed development build with `npx expo start --dev-client --tunnel`. For the existing demo use `npx expo start --go --tunnel` instead.

## Read actual data

1. Let your Apple Watch sync to the iPhone Health app.
2. For WHOOP, enable Apple Health sharing inside the WHOOP app and choose supported data types to export.
3. Open the MISE development build, sign in, and open Vitals.
4. Tap **Read and save to my account**, then choose HealthKit read permissions.
5. Inspect the saved summary in Vitals and in Back4App's `_User.healthSnapshot` field.

Only a manual sync reads and uploads data. The app requests steps, resting heart rate, and sleep read access; no write permissions or background delivery. Each sync replaces the previous summary. Steps use today's highest-total single source instead of adding overlapping device totals. This may differ from Apple Health's chosen source priority. Sleep merges overlapping asleep intervals across sources within the last 24 hours and excludes awake/in-bed entries. Resting HR is the most recent sample in that window. Missing/denied data stays unavailable rather than becoming zero. The system does not expose read-denial status.

Real data remains separate from the fictional age/weight/device/preferences and from the sample vitals shown below the connection card. Menus remain demo recommendations. The summary lives on the private user record, so deleting the account deletes it. **Remove saved readings** removes the server summary; revoke HealthKit access separately in Apple Health.

## Verification status

Type checking, lint, iOS JavaScript bundling, config entitlements, and sleep aggregation tests checked. Live Back4App tests verified summary save/read/remove with synthetic data on a disposable account, then deleted the account. Actual native compilation, permission presentation, watch retrieval, and Expo Go runtime need device verification.

References: https://github.com/kingstinct/react-native-healthkit · https://support.whoop.com/s/article/Apple-Health-Integration?language=en_US
