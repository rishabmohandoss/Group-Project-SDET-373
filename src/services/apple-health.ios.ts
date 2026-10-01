import Constants, { ExecutionEnvironment } from 'expo-constants';
import { sleepMinutes, type HealthSnapshot } from '@/lib/health-data';
export const healthAvailabilityMessage = Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  ? 'Apple Health requires an iPhone development build. Your Expo Go demo still works, but cannot read wearable data.' : '';
export async function readAppleHealth(): Promise<HealthSnapshot> {
  if (healthAvailabilityMessage) throw new Error(healthAvailabilityMessage);
  // Load only after the Expo Go guard: Nitro native modules are absent in Expo Go.
  const health = await import('@kingstinct/react-native-healthkit');
  if (!await health.isHealthDataAvailable()) throw new Error('Apple Health is unavailable on this device.');
  await health.requestAuthorization({toRead: [
    'HKQuantityTypeIdentifierStepCount', 'HKQuantityTypeIdentifierRestingHeartRate', 'HKCategoryTypeIdentifierSleepAnalysis',
  ]});
  const end = new Date();
  const start = new Date(end); start.setHours(0,0,0,0);
  const sleepStart = new Date(end.getTime() - 24*60*60*1000);
  const [stepsBySource, heart, sleep] = await Promise.all([
    health.queryStatisticsForQuantitySeparateBySource('HKQuantityTypeIdentifierStepCount', ['cumulativeSum'], {unit:'count',filter:{date:{startDate:start,endDate:end}}}),
    health.queryQuantitySamples('HKQuantityTypeIdentifierRestingHeartRate', {unit:'count/min',limit:1,ascending:false,filter:{date:{startDate:sleepStart,endDate:end}}}),
    health.queryCategorySamples('HKCategoryTypeIdentifierSleepAnalysis', {limit:0,filter:{date:{startDate:sleepStart,endDate:end}}}),
  ]);
  // Pick one source, never add watch/phone/WHOOP step totals together.
  const step = [...stepsBySource].filter(x => x.sumQuantity != null)
    .sort((a,b) => b.sumQuantity!.quantity-a.sumQuantity!.quantity)[0];
  const sources = new Set<string>();
  if (step) sources.add(step.source.name);
  [...heart,...sleep].forEach(x => { if(x.sourceRevision?.source.name) sources.add(x.sourceRevision.source.name); });
  return {
    provider:'apple-health', syncedAt:end.toISOString(), dayStart:start.toISOString(), sleepWindowStart:sleepStart.toISOString(),
    steps:step?.sumQuantity?.quantity ?? null, stepSource:step?.source.name ?? null,
    restingHeartRate:heart[0]?.quantity ?? null,
    sleepMinutes:sleepMinutes(sleep,sleepStart,end), sources:[...sources],
  };
}
