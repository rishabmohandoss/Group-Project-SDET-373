import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { HealthSnapshot } from '@/lib/health-data';

export const healthAvailabilityMessage = Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  ? 'Health Connect requires an Android development build. Your Expo Go demo still works, but cannot read wearable data.' : '';

// Health Connect sleep stages that are not sleep: awake (1), out of bed (3), awake in bed (7).
const NOT_ASLEEP = new Set([1, 3, 7]);

/** Reads Health Connect, where Pixel Watch, Fitbit and other Android apps write their data. Same output shape as the iOS reader. */
export async function readAppleHealth(): Promise<HealthSnapshot> {
  if (healthAvailabilityMessage) throw new Error(healthAvailabilityMessage);
  // Load only after the Expo Go guard: the native module is absent in Expo Go.
  const hc = await import('react-native-health-connect');
  const status = await hc.getSdkStatus();
  if (status !== hc.SdkAvailabilityStatus.SDK_AVAILABLE) throw new Error('Health Connect is not installed or needs an update. Install it from the Play Store, then try again.');
  if (!await hc.initialize()) throw new Error('Could not start Health Connect.');
  const granted = await hc.requestPermission([
    { accessType: 'read', recordType: 'Steps' },
    { accessType: 'read', recordType: 'RestingHeartRate' },
    { accessType: 'read', recordType: 'SleepSession' },
  ]);
  const can = (type: string) => granted.some(p => p.recordType === type && p.accessType === 'read');

  const end = new Date();
  const start = new Date(end); start.setHours(0, 0, 0, 0);
  const sleepStart = new Date(end.getTime() - 24 * 60 * 60 * 1000);
  const range = (from: Date) => ({ operator: 'between' as const, startTime: from.toISOString(), endTime: end.toISOString() });

  // Steps: total per app (Fitbit, Pixel Watch, phone), then use the highest single source, never a sum.
  let steps: number | null = null, stepSource: string | null = null;
  if (can('Steps')) {
    const { records } = await hc.readRecords('Steps', { timeRangeFilter: range(start) });
    const totals = new Map<string, number>();
    for (const r of records) {
      const origin = r.metadata?.dataOrigin ?? 'Unknown';
      totals.set(origin, (totals.get(origin) ?? 0) + r.count);
    }
    const best = [...totals.entries()].sort((a, b) => b[1] - a[1])[0];
    if (best) { steps = best[1]; stepSource = best[0]; }
  }

  let restingHeartRate: number | null = null;
  const sources = new Set<string>();
  if (stepSource) sources.add(stepSource);
  if (can('RestingHeartRate')) {
    const { records } = await hc.readRecords('RestingHeartRate', { timeRangeFilter: range(sleepStart) });
    const latest = [...records].sort((a, b) => +new Date(b.time) - +new Date(a.time))[0];
    if (latest) { restingHeartRate = latest.beatsPerMinute; if (latest.metadata?.dataOrigin) sources.add(latest.metadata.dataOrigin); }
  }

  let sleepMinutes: number | null = null;
  if (can('SleepSession')) {
    const { records } = await hc.readRecords('SleepSession', { timeRangeFilter: range(sleepStart) });
    const intervals: [number, number][] = [];
    for (const r of records) {
      if (r.metadata?.dataOrigin) sources.add(r.metadata.dataOrigin);
      const parts = r.stages?.length ? r.stages.filter(s => !NOT_ASLEEP.has(s.stage)) : [r];
      for (const p of parts) {
        const a = Math.max(+new Date(p.startTime), sleepStart.getTime()), b = Math.min(+new Date(p.endTime), end.getTime());
        if (b > a) intervals.push([a, b]);
      }
    }
    if (intervals.length) {
      intervals.sort((a, b) => a[0] - b[0]);
      let [from, to] = intervals[0], total = 0;
      for (const [a, b] of intervals.slice(1)) { if (a <= to) to = Math.max(to, b); else { total += to - from; from = a; to = b; } }
      sleepMinutes = Math.round((total + to - from) / 60000);
    }
  }

  return {
    provider: 'health-connect', syncedAt: end.toISOString(), dayStart: start.toISOString(), sleepWindowStart: sleepStart.toISOString(),
    steps, stepSource, restingHeartRate, sleepMinutes, sources: [...sources],
  };
}
