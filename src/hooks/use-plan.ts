import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { getOrCreatePlan, swapMeal, type DayPlan } from '@/lib/plan';
import { loadPreferences, type FoodPreferences } from '@/lib/preferences';
import type { MealSlot } from '@/lib/recipes';

/** Today's meal plan, rebuilt from the current food preferences whenever the screen is focused. */
export function usePlan() {
  const [plan, setPlan] = useState<DayPlan | null>(null);
  const [prefs, setPrefs] = useState<FoodPreferences | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<MealSlot | 'all' | null>(null);

  const load = useCallback(async (force = false) => {
    setError(''); setBusy('all');
    try {
      const p = await loadPreferences(); setPrefs(p);
      setPlan(await getOrCreatePlan(p, force));
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not load your menu.'); }
    finally { setBusy(null); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const swap = async (slot: MealSlot) => {
    if (!prefs) return;
    setBusy(slot);
    try { setPlan(await swapMeal(slot, prefs)); } catch (e) { setError(e instanceof Error ? e.message : 'Could not swap.'); }
    finally { setBusy(null); }
  };
  return { plan, prefs, error, busy, reload: () => load(true), swap };
}
