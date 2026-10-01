import type { HealthSnapshot } from '@/lib/health-data';
export const healthAvailabilityMessage = 'Apple Health requires an iPhone development build. It is unavailable in Expo Go, Android, and the web demo.';
export async function readAppleHealth(): Promise<HealthSnapshot> {
  throw new Error(healthAvailabilityMessage);
}
