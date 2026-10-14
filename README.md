# MISE

MISE is a food and wellness app built with Expo (React Native) and Back4App. It builds a daily menu from real recipes that fit your diet and tastes, finds restaurants near you, reminds you to eat with notifications you can schedule, and can read steps, resting heart rate and sleep from a wearable.

It runs in Expo Go for everything except wearable data, which needs a development build (see [Wearables](#wearables)).

## What the app does

| Tab | What it does |
| --- | --- |
| **Today** | Greets you, shows your next meal for the time of day, your food preferences, a "how was last night's dinner?" check-in, and a button that sends a test notification. |
| **Vitals** | Wearable connection card (Apple Health on iPhone, Health Connect on Android) plus sample readings, clearly labelled as samples. |
| **Discover** | Search recipes by name (filtered to your diet and avoided foods) and find restaurants and cafes within about 1.5 km using your location. |
| **Plan** | Today's breakfast, lunch and dinner with photos, ingredients and method. Swap any meal, or build a fresh menu. |
| **List** | A shopping list merged from today's menu. Ticks are remembered. |
| **You** | Profile, **food preferences** (diet, cuisines, foods to avoid, longest cook time, budget per serving) and **notification settings**. |

### Notifications
- Meal reminders for breakfast, lunch and dinner, with a scrollable time picker for each. Defaults are 8:00 AM, 12:30 PM and 6:30 PM. Each meal can be switched off, and sound can be turned off.
- Reminders are local notifications scheduled for the next 7 days every time the app opens, with the message varying by day. They work in Expo Go on iPhone and Android, not on web.
- Every notification that arrives or is tapped is logged to Back4App (see [Backend](#backend)). This needs a signed-in user.

### Recipes and places
- **TheMealDB** (free, no key) is the default recipe source. It has no cooking time or cost.
- **Spoonacular** (optional, needs a key) adds cooking time, cost per serving, calories and protein. It runs through a Back4App Cloud Code function so the key never ships in the app. Without it, the app falls back to TheMealDB.
- **OpenStreetMap** (via Overpass, free) supplies nearby places. It has no prices or opening hours.
- Diet and avoided foods are checked against each recipe's ingredient list.

## Architecture

```
Expo app (React Native, Expo Router)
  ├── Back4App / Parse JS SDK ── accounts, preferences, feedback, notification log
  │       └── Cloud Code `recipes` ── Spoonacular (key stored server side)
  ├── TheMealDB ── recipes (fallback)
  ├── Overpass / OpenStreetMap ── nearby places
  └── expo-notifications ── local meal reminders
```

### Frontend
- Expo SDK 57, React Native 0.86, Expo Router with typed routes, React Compiler.
- Screens are in `src/app`. Shared UI is in `src/components`. Data and API code is in `src/lib`. Platform health readers are in `src/services`.
- Key files: `src/lib/recipes.ts`, `src/lib/plan.ts`, `src/lib/nearby.ts`, `src/lib/preferences.ts`, `src/lib/notifications.ts`, `src/lib/notification-log.ts`.

### Backend
Back4App (hosted Parse Server). The app talks to it with the Parse JavaScript SDK.

| Class / field | Purpose |
| --- | --- |
| `_User` | Email/password accounts. Holds `displayName`, `foodPreferences`, `expoPushToken`, `healthSnapshot` and fictional sample profile fields. |
| `NotificationLog` | One row per notification received or opened: user, event, title, body, meal, time, platform. Private to the user. |
| `MealFeedback` | Ratings for past dinners (loved, fine, never). Private to the user. |
| `RecipeCache` | Created by Cloud Code. Caches Spoonacular results for 24 hours. |

Classes are created on first write. If your Back4App server blocks automatic class creation, add them in the dashboard first. Cloud Code lives in [`cloud/main.js`](cloud/main.js).

## Demo login

A demo account exists for testing:

- **Email:** `demo@mise-app.test`
- **Password:** not stored in this repository. Ask the project owner, or create your own account with **Create account** on the sign-in screen.

On the welcome screen tap **I already have a profile** and sign in. The email address is fake, so password reset emails will not arrive.

You can also tap **Preview demo without an account** to use the app signed out. Signed out, preferences and notification settings stay on the phone, notifications are not logged, and recipes come from TheMealDB.

## Run it

Requirements: Node 20+ and the Expo Go app on your phone.

```bash
npm install
cp .env.example .env.local   # then add your Back4App JavaScript key
npx expo start --go --tunnel
```

Scan the QR code with Expo Go. `--tunnel` helps on networks that block local connections, such as school Wi-Fi. Use the **JavaScript key**, never the Master Key. Details are in [BACKEND_SETUP.md](BACKEND_SETUP.md).

### Enable Spoonacular recipes (optional)
1. Get a key at spoonacular.com/food-api.
2. In Back4App, open Server Settings → Core Settings → Environment Variables and add `SPOONACULAR_KEY`.
3. Open Cloud Code → Functions & Web Hosting, upload `cloud/main.js` into the `cloud` folder, and Deploy.
4. Sign in, set a cooking time in the You tab, then open Plan and tap **Build a fresh menu**.

## Wearables

Neither wearable can be read from Expo Go. Both need a development build.

- **Apple Watch** (through Apple Health) uses `@kingstinct/react-native-healthkit`. Building for an iPhone needs Xcode. See [WEARABLE_SETUP.md](WEARABLE_SETUP.md).
- **Pixel Watch and Fitbit** (through Health Connect) use `react-native-health-connect`. Build with `npx eas-cli build --profile development --platform android`.
- **WHOOP** is planned through its developer API and has not been built.

Wearable sync is manual, reads steps, resting heart rate and sleep, and stores only a summary on the user's record.

## Current limitations
- Recipes from TheMealDB have no cost or cooking time, and the catalogue is a few hundred recipes.
- Nearby places have no prices or opening hours.
- Meal feedback is stored but does not yet change future menus.
- Vitals readings below the wearable card are sample data.
- Notification logging cannot see notifications that were dismissed before the app next opened.
- Settings and meal plans are stored on the phone, so they do not follow you to another device (preferences also sync to your account).
- The sample profile fields created at signup (age, sex, weight, example watch) are fictional.

## More documentation
[MISE_PROJECT_GUIDE.md](MISE_PROJECT_GUIDE.md) · [BACKEND_SETUP.md](BACKEND_SETUP.md) · [WEARABLE_SETUP.md](WEARABLE_SETUP.md) · [AGENTS.md](AGENTS.md)

Some older text in the project guide still describes the sample menu, plan and shopping list. The recipe, plan, list, preferences and notification features above replace it.
