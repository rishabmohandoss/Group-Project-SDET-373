import { Parse, backendConfigured } from './back4app';
import type { HealthSnapshot } from './health-data';

export async function healthUser() {
  if (!backendConfigured) throw new Error('Back4App is not configured.');
  const user = await Parse.User.currentAsync();
  if (!user) throw new Error('Sign in to connect Apple Health and save your readings.');
  return user;
}
export async function loadHealthSnapshot(): Promise<HealthSnapshot | null> {
  const user = await healthUser();
  await user.fetch();
  return user.get('healthSnapshot') ?? null;
}
export async function saveHealthSnapshot(snapshot: HealthSnapshot, expectedUserId: string) {
  const user = await healthUser();
  if (user.id !== expectedUserId) throw new Error('Your account changed. Please sync again.');
  // Keep real readings separate from fictional onboarding fields. Account deletion removes both.
  await user.save({healthSnapshot:snapshot});
}
export async function removeHealthSnapshot() {
  const user = await healthUser();
  user.unset('healthSnapshot');
  await user.save();
}
