import { Parse, backendConfigured } from './back4app';
import { createDemoProfile, type DemoProfile } from './demo-profile';

export type Profile = {
  id: string;
  display_name: string;
  email: string;
  goal_steps: number;
  age?: number;
  sex?: string;
  weightKg?: number;
  device?: DemoProfile['device'];
  preferences?: DemoProfile['preferences'];
  profileDataSource?: string;
};
type Listener = (profile: Profile | null) => void;
const listeners = new Set<Listener>();
function profileOf(user: Parse.User): Profile {
  return {
    id: user.id!, display_name: user.get('displayName') || 'Member',
    email: user.getEmail() || '', goal_steps: user.get('goalSteps') || 10000,
    age: user.get('age'), sex: user.get('sex'), weightKg: user.get('weightKg'),
    device: user.get('device'), preferences: user.get('preferences'),
    profileDataSource: user.get('profileDataSource'),
  };
}
function publish(profile: Profile | null) {
  listeners.forEach(listener => listener(profile));
  return profile;
}
export function onAccountChange(listener: Listener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
export async function getProfile(): Promise<Profile | null> {
  if (!backendConfigured) return null;
  const user = await Parse.User.currentAsync();
  if (!user) return null;
  try {
    await user.fetch();
    return profileOf(user);
  } catch (error) {
    if ((error as { code?: number }).code === 209) {
      await Parse.User.logOut();
      return publish(null);
    }
    throw error;
  }
}
export async function signUp(email: string, password: string, name: string) {
  if (!backendConfigured) throw new Error('Back4App connection is not configured yet.');
  const user = new Parse.User();
  user.setUsername(email.trim().toLowerCase());
  user.setEmail(email.trim().toLowerCase());
  user.setPassword(password);
  user.set('displayName', name.trim());
  user.set('goalSteps', 10000);
  // Persist these fields with the account in one signup request, not a second save.
  user.set(createDemoProfile());
  // Parse Server adds the new user's own permissions during signup.
  user.setACL(new Parse.ACL());
  await user.signUp();
  return publish(profileOf(user));
}
export async function signIn(email: string, password: string) {
  return publish(profileOf(await Parse.User.logIn(email.trim().toLowerCase(), password)));
}
export async function signOut() {
  await Parse.User.logOut();
  publish(null);
}
export async function resetPassword(email: string) {
  await Parse.User.requestPasswordReset(email.trim().toLowerCase());
}
export async function deleteAccount() {
  const user = await Parse.User.currentAsync();
  if (!user) throw new Error('Sign in before deleting your account.');
  // All persisted profile data lives on this user object.
  await user.destroy();
  await signOut();
}
