import type { Diet, FoodPreferences } from '@/lib/preferences';

const API = 'https://www.themealdb.com/api/json/v1/1';
export type MealSlot = 'breakfast' | 'lunch' | 'dinner';
export type Recipe = {
  id: string; name: string; category: string; area: string; image: string;
  instructions: string; ingredients: { name: string; measure: string }[]; source: string | null; video: string | null;
};

const SLOT_CATEGORIES: Record<MealSlot, string[]> = {
  breakfast: ['Breakfast'],
  lunch: ['Starter', 'Side', 'Pasta', 'Vegetarian', 'Vegan', 'Chicken', 'Seafood', 'Miscellaneous'],
  dinner: ['Chicken', 'Beef', 'Lamb', 'Pork', 'Seafood', 'Pasta', 'Vegetarian', 'Vegan', 'Goat', 'Miscellaneous'],
};
const MEAT = ['chicken', 'beef', 'pork', 'lamb', 'goat', 'bacon', 'ham', 'sausage', 'turkey', 'duck', 'mince', 'steak', 'prosciutto', 'chorizo', 'veal', 'gelatin', 'lard', 'pancetta', 'salami'];
const FISH = ['salmon', 'tuna', 'cod', 'prawn', 'shrimp', 'anchov', 'fish', 'mackerel', 'squid', 'mussel', 'clam', 'crab', 'lobster', 'haddock', 'sardine', 'oyster', 'scallop', 'trout', 'seabass', 'sea bass'];
const ANIMAL = ['egg', 'milk', 'cheese', 'butter', 'cream', 'yogurt', 'yoghurt', 'honey', 'parmesan', 'mozzarella', 'feta', 'ghee', 'mayonnaise'];

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API}/${path}`);
  if (!res.ok) throw new Error('Could not reach the recipe service. Check your connection.');
  return res.json();
}

function toRecipe(m: Record<string, string | null>): Recipe {
  const ingredients: Recipe['ingredients'] = [];
  for (let i = 1; i <= 20; i++) {
    const name = m[`strIngredient${i}`]?.trim();
    if (name) ingredients.push({ name, measure: (m[`strMeasure${i}`] ?? '').trim() });
  }
  return {
    id: m.idMeal!, name: m.strMeal!, category: m.strCategory ?? '', area: m.strArea ?? '', image: m.strMealThumb ?? '',
    instructions: (m.strInstructions ?? '').replace(/\r\n/g, '\n').trim(), ingredients,
    source: m.strSource || null, video: m.strYoutube || null,
  };
}

export async function lookup(id: string): Promise<Recipe | null> {
  const data = await get<{ meals: Record<string, string | null>[] | null }>(`lookup.php?i=${id}`);
  return data.meals?.[0] ? toRecipe(data.meals[0]) : null;
}
export async function search(query: string): Promise<Recipe[]> {
  const data = await get<{ meals: Record<string, string | null>[] | null }>(`search.php?s=${encodeURIComponent(query)}`);
  return (data.meals ?? []).map(toRecipe);
}

/** True if the recipe fits the diet and has none of the foods the user avoids. */
export function fits(recipe: Recipe, prefs: FoodPreferences): boolean {
  const text = [recipe.name, ...recipe.ingredients.map(i => i.name)].join(' ').toLowerCase();
  const has = (words: string[]) => words.some(w => text.includes(w));
  if (prefs.avoid.some(a => a && text.includes(a.toLowerCase()))) return false;
  const banned: Record<Diet, string[]> = { anything: [], vegetarian: [...MEAT, ...FISH], pescatarian: MEAT, vegan: [...MEAT, ...FISH, ...ANIMAL] };
  return !has(banned[prefs.diet]);
}

function hash(text: string) { let h = 2166136261; for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

/** Lists candidate recipe ids for a meal slot, favourite cuisines first, in an order that is stable for the given seed. */
export async function candidateIds(slot: MealSlot, prefs: FoodPreferences, seed: string): Promise<string[]> {
  const lists = await Promise.all(SLOT_CATEGORIES[slot].map(c => get<{ meals: { idMeal: string }[] | null }>(`filter.php?c=${c}`).catch(() => ({ meals: null }))));
  const ids = [...new Set(lists.flatMap(l => (l.meals ?? []).map(m => m.idMeal)))];
  const fav = new Set((await Promise.all(prefs.cuisines.map(a => get<{ meals: { idMeal: string }[] | null }>(`filter.php?a=${a}`).catch(() => ({ meals: null }))))).flatMap(l => (l.meals ?? []).map(m => m.idMeal)));
  return ids.sort((a, b) => (fav.has(b) ? 1 : 0) - (fav.has(a) ? 1 : 0) || hash(seed + a) - hash(seed + b));
}

/** Walks the candidate list and returns the first recipe that fits, skipping ids already used. */
export async function pickRecipe(ids: string[], prefs: FoodPreferences, exclude: string[] = []): Promise<Recipe | null> {
  let checked = 0;
  for (const id of ids) {
    if (exclude.includes(id)) continue;
    if (++checked > 25) break;
    const recipe = await lookup(id).catch(() => null);
    if (recipe && fits(recipe, prefs)) return recipe;
  }
  return null;
}
