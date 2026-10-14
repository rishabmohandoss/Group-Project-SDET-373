import AsyncStorage from '@react-native-async-storage/async-storage';
import { Parse, backendConfigured } from '@/lib/back4app';
import { candidateIds, pickRecipe, type MealSlot, type Recipe } from '@/lib/recipes';
import type { FoodPreferences } from '@/lib/preferences';

export const SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner'];
export type DayPlan = { date: string; meals: Partial<Record<MealSlot, Recipe>>; used: string[] };
export type Feedback = { id: string; name: string; area: string; rating: 'loved' | 'fine' | 'never'; at: string };

export const today = () => dayKey(new Date());
export function dayKey(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
const planKey = (date: string) => `mise.plan.${date}`;

export async function loadPlan(date = today()): Promise<DayPlan | null> {
  try { const raw = await AsyncStorage.getItem(planKey(date)); return raw ? JSON.parse(raw) : null; } catch { return null; }
}
async function savePlan(plan: DayPlan) { await AsyncStorage.setItem(planKey(plan.date), JSON.stringify(plan)); }

/** Loads today's plan, building it from the recipe service the first time each day or when preferences change. */
export async function getOrCreatePlan(prefs: FoodPreferences, force = false): Promise<DayPlan> {
  const existing = force ? null : await loadPlan();
  if (existing && SLOTS.every(s => existing.meals[s])) return existing;
  const plan: DayPlan = { date: today(), meals: {}, used: [] };
  for (const slot of SLOTS) await fill(plan, slot, prefs, []);
  await savePlan(plan);
  return plan;
}
async function fill(plan: DayPlan, slot: MealSlot, prefs: FoodPreferences, skip: string[]) {
  const ids = await candidateIds(slot, prefs, `${plan.date}:${slot}`);
  const recipe = await pickRecipe(ids, prefs, [...plan.used, ...skip]);
  if (recipe) { plan.meals[slot] = recipe; plan.used.push(recipe.id); }
}
/** Replaces one meal with the next recipe that fits. */
export async function swapMeal(slot: MealSlot, prefs: FoodPreferences): Promise<DayPlan> {
  const plan = (await loadPlan()) ?? (await getOrCreatePlan(prefs));
  await fill(plan, slot, prefs, plan.meals[slot] ? [plan.meals[slot]!.id] : []);
  await savePlan(plan);
  return plan;
}

export async function recordFeedback(recipe: Recipe, rating: Feedback['rating']) {
  const entry: Feedback = { id: recipe.id, name: recipe.name, area: recipe.area, rating, at: new Date().toISOString() };
  const raw = await AsyncStorage.getItem('mise.feedback');
  const all: Feedback[] = raw ? JSON.parse(raw) : [];
  await AsyncStorage.setItem('mise.feedback', JSON.stringify([...all.filter(f => f.id !== recipe.id), entry].slice(-100)));
  const user = backendConfigured ? Parse.User.current() : null;
  if (user) {
    const row = new Parse.Object('MealFeedback');
    row.set({ user, recipeId: recipe.id, recipeName: recipe.name, area: recipe.area, rating });
    row.setACL(new Parse.ACL(user));
    await row.save();
  }
}
export async function loadFeedback(): Promise<Feedback[]> {
  try { return JSON.parse((await AsyncStorage.getItem('mise.feedback')) ?? '[]'); } catch { return []; }
}
