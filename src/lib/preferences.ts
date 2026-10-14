import AsyncStorage from '@react-native-async-storage/async-storage';
import { Parse, backendConfigured } from '@/lib/back4app';

export type Diet = 'anything' | 'vegetarian' | 'vegan' | 'pescatarian';
export type FoodPreferences = { diet: Diet; cuisines: string[]; avoid: string[] };

export const DIETS: { id: Diet; label: string }[] = [
  { id: 'anything', label: 'Anything' }, { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' }, { id: 'pescatarian', label: 'Pescatarian' },
];
// Cuisines TheMealDB has recipes for.
export const CUISINES = ['American', 'British', 'Chinese', 'French', 'Greek', 'Indian', 'Italian', 'Japanese', 'Mexican', 'Moroccan', 'Spanish', 'Thai', 'Turkish', 'Vietnamese'];
export const DEFAULT_PREFERENCES: FoodPreferences = { diet: 'anything', cuisines: [], avoid: [] };
const KEY = 'mise.foodPreferences';

export async function loadPreferences(): Promise<FoodPreferences> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
    // First run on this device: pull saved preferences from the account, if any.
    const user = backendConfigured ? Parse.User.current() : null;
    const remote = user?.get('foodPreferences');
    if (remote) { await AsyncStorage.setItem(KEY, JSON.stringify(remote)); return { ...DEFAULT_PREFERENCES, ...remote }; }
  } catch { /* fall through to defaults */ }
  return DEFAULT_PREFERENCES;
}

export async function savePreferences(prefs: FoodPreferences) {
  await AsyncStorage.setItem(KEY, JSON.stringify(prefs));
  const user = backendConfigured ? Parse.User.current() : null;
  if (user) { user.set('foodPreferences', prefs); await user.save(); }
}
