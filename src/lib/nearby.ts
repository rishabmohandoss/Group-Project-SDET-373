import * as Location from 'expo-location';
import type { FoodPreferences } from '@/lib/preferences';

export type Place = { id: string; name: string; kind: string; cuisine: string | null; meters: number; lat: number; lon: number; dietMatch: boolean; cuisineMatch: boolean };

function distance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const r = (d: number) => (d * Math.PI) / 180, R = 6371000;
  const a = Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/** Finds restaurants and cafes near the phone using OpenStreetMap data (free, no key). */
export async function findNearby(prefs: FoodPreferences, radius = 1500): Promise<Place[]> {
  const perm = await Location.requestForegroundPermissionsAsync();
  if (!perm.granted) throw new Error('Location is off for MISE. Enable it in your phone settings to see places near you.');
  const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const query = `[out:json][timeout:20];nwr(around:${radius},${coords.latitude},${coords.longitude})[amenity~"^(restaurant|cafe|fast_food)$"][name];out center 60;`;
  let res: Response | null = null;
  // Overpass rejects requests without an Accept header; a second server covers outages.
  for (const server of ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']) {
    try {
      res = await fetch(server, { method: 'POST', body: `data=${encodeURIComponent(query)}`, headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' } });
      if (res.ok) break;
    } catch { res = null; }
  }
  if (!res?.ok) throw new Error('The places service is busy. Try again in a moment.');
  const data = await res.json() as { elements: { type: string; id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags: Record<string, string> }[] };
  const wantsDiet = prefs.diet === 'vegetarian' || prefs.diet === 'vegan';
  const places = data.elements.flatMap(e => {
    const lat = e.lat ?? e.center?.lat, lon = e.lon ?? e.center?.lon;
    if (lat == null || lon == null) return [];
    const t = e.tags, cuisine = t.cuisine ? t.cuisine.replace(/_/g, ' ').replace(/;/g, ', ') : null;
    const dietMatch = prefs.diet === 'vegan' ? ['yes', 'only'].includes(t['diet:vegan']) : wantsDiet ? ['yes', 'only'].includes(t['diet:vegetarian']) || ['yes', 'only'].includes(t['diet:vegan']) : false;
    const cuisineMatch = !!cuisine && prefs.cuisines.some(c => cuisine.toLowerCase().includes(c.toLowerCase()));
    return [{ id: `${e.type}${e.id}`, name: t.name, kind: t.amenity.replace('_', ' '), cuisine, meters: Math.round(distance(coords.latitude, coords.longitude, lat, lon)), lat, lon, dietMatch, cuisineMatch }];
  });
  return places.sort((a, b) => Number(b.dietMatch) - Number(a.dietMatch) || Number(b.cuisineMatch) - Number(a.cuisineMatch) || a.meters - b.meters).slice(0, 25);
}
