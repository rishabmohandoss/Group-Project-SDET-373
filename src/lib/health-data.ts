export type HealthSnapshot = {
  provider: 'apple-health';
  syncedAt: string;
  dayStart: string;
  sleepWindowStart: string;
  steps: number | null;
  stepSource: string | null;
  restingHeartRate: number | null;
  sleepMinutes: number | null;
  sources: string[];
};

// Merge overlapping sleep stages/sources, excluding awake and in-bed samples.
export function sleepMinutes(samples: readonly {startDate: Date; endDate: Date; value: number}[], start: Date, end: Date): number | null {
  const intervals = samples.filter(x => [1, 3, 4, 5].includes(x.value))
    .map(x => [Math.max(x.startDate.getTime(), start.getTime()), Math.min(x.endDate.getTime(), end.getTime())])
    .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && b > a)
    .sort((a,b) => a[0] - b[0]);
  if (!intervals.length) return null;
  let [from,to] = intervals[0];
  let total = 0;
  for (const [a,b] of intervals.slice(1)) {
    if (a <= to) to = Math.max(to,b);
    else { total += to-from; from=a; to=b; }
  }
  return Math.round((total+to-from)/60000);
}
