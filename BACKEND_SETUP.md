# Back4App setup

The Expo Go app uses Back4App through the Parse JavaScript SDK. Your application ID is configured in `.env.local`.

1. Open Back4App → your app → App Settings → Security & Keys.
2. Copy the **JavaScript key** into `EXPO_PUBLIC_BACK4APP_JAVASCRIPT_KEY` in `.env.local`. Do not use the Master Key.
3. Restart Expo: `npx expo start --tunnel --clear`.
4. Create an account in MISE. In the Back4App database browser, verify the new `_User` row.

Email/password sign-up, sign-in, persisted sessions, password reset, sign-out, and account deletion use Back4App. Profile name and step goal are fields on `_User`; deleting the user removes that profile. No separate SQL schema or Cloud Code deployment is needed for this version. Existing Supabase accounts are not migrated.

New accounts have a private ACL. Check `_User` class permissions in the dashboard: allow signup, restrict user listing/public reads, and require owner permissions for updates and deletion. Password reset email delivery depends on the app's Back4App email configuration. Enable email verification and configure email templates before release if required for your product.

Health readings, recipes, meal plans, saved recipe selections, feedback, and shopping-list selections remain demo/local data. They are not uploaded. If new related server data is added later, extend account deletion to remove it too.

## Verification

### Signup profile fields

Every new signup sends the real name/email and fictional profile fields together in the same `_User` creation request. Open **Database → Browser → User (_User)** to inspect the record after signup:

| Column | Type | Demo value |
| --- | --- | --- |
| displayName | String | Name entered at signup |
| age | Number | 24 |
| sex | String | female |
| weightKg | Number | 65 |
| device | Object | Apple Watch Series 9, isConnected: false, connectionStatus: demo |
| preferences | Object | Mediterranean diet, favorite cuisines, disliked foods, USD 6–12 budget, 30-minute cooking limit, Hot spice, wellness goals |
| profileDataSource | String | demo |
| demoProfileVersion | Number | 1 |
| goalSteps | Number | 10000 |

These values are fictional, not derived from the account holder. The You tab reads the saved fields back from Back4App and labels them as samples. Signing in never overwrites profile fields. Older accounts are left unchanged. Deleting the account deletes these fields with it.

If your Back4App server disables automatic field creation, add the columns above on `_User` in the dashboard before signup. Never allow public access to these profile fields.

With the JavaScript key configured, create a disposable account, sign out, sign in again, reload the app to check session persistence, request a password reset email, then delete the account from You. Confirm the row is gone and signing in fails. Use another account to confirm it cannot read the first user's profile.

Without the key, account requests are disabled and the demo remains available. This backend migration alone does not complete App Store submission requirements: the privacy-policy template still needs real contact details and hosting, plus accurate store privacy disclosures.

Reference: https://www.back4app.com/docs/react-native/parse-sdk/react-native-sdk
