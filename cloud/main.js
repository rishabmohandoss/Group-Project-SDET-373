/* Back4App Cloud Code: proxies Spoonacular so the API key never ships inside the app.
 * Upload this file to Cloud Code > Functions & Web Hosting > cloud/main.js, then Deploy.
 * Set SPOONACULAR_KEY under Server Settings > Core Settings > Environment Variables. */
const TYPES = { breakfast: 'breakfast', lunch: 'main course', dinner: 'main course' };
const CACHE_MS = 24 * 60 * 60 * 1000;

Parse.Cloud.define('recipes', async request => {
  if (!request.user) throw new Parse.Error(Parse.Error.INVALID_SESSION_TOKEN, 'Sign in to get personalised recipes.');
  const key = process.env.SPOONACULAR_KEY;
  if (!key) throw new Parse.Error(Parse.Error.SCRIPT_FAILED, 'Recipe service is not configured.');
  const { slot = 'dinner', diet = 'anything', cuisines = [], avoid = [], maxMinutes = 0 } = request.params;
  if (!TYPES[slot]) throw new Parse.Error(Parse.Error.INVALID_QUERY, 'Unknown meal slot.');

  const params = new URLSearchParams({
    apiKey: key, type: TYPES[slot], number: '12', sort: 'random', addRecipeInformation: 'true', addRecipeNutrition: 'true', instructionsRequired: 'true', fillIngredients: 'true',
  });
  if (diet !== 'anything') params.set('diet', diet === 'pescatarian' ? 'pescetarian' : diet);
  if (cuisines.length) params.set('cuisine', cuisines.slice(0, 10).join(','));
  if (avoid.length) params.set('excludeIngredients', avoid.slice(0, 20).join(','));
  if (maxMinutes > 0) params.set('maxReadyTime', String(maxMinutes));

  // Random results are cached per user and query for a day so one person cannot burn the daily quota.
  const cacheKey = `${request.user.id}:${slot}:${params.toString().replace(/apiKey=[^&]*&?/, '')}`;
  const Cache = Parse.Object.extend('RecipeCache');
  const hit = await new Parse.Query(Cache).equalTo('key', cacheKey).first({ useMasterKey: true });
  if (hit && Date.now() - hit.get('savedAt') < CACHE_MS) return hit.get('results');

  const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params}`);
  if (res.status === 402 || res.status === 429) throw new Parse.Error(Parse.Error.SCRIPT_FAILED, 'Recipe quota reached for today.');
  if (!res.ok) throw new Parse.Error(Parse.Error.SCRIPT_FAILED, `Recipe service error ${res.status}.`);
  const data = await res.json();
  const results = (data.results || []).map(r => ({
    id: `s${r.id}`, name: r.title, image: r.image || '', category: (r.dishTypes && r.dishTypes[0]) || slot, area: (r.cuisines && r.cuisines[0]) || '',
    readyInMinutes: r.readyInMinutes ?? null, servings: r.servings ?? null, pricePerServing: r.pricePerServing != null ? Math.round(r.pricePerServing) / 100 : null,
    calories: ((r.nutrition && r.nutrition.nutrients) || []).find(n => n.name === 'Calories')?.amount ?? null,
    protein: ((r.nutrition && r.nutrition.nutrients) || []).find(n => n.name === 'Protein')?.amount ?? null,
    ingredients: (r.extendedIngredients || []).map(i => ({ name: i.name, measure: i.original })),
    instructions: ((r.analyzedInstructions && r.analyzedInstructions[0] && r.analyzedInstructions[0].steps) || []).map(s => `${s.number}. ${s.step}`).join('\n'),
    source: r.sourceUrl || null, video: null,
  }));
  const row = hit || new Cache();
  row.set({ key: cacheKey, savedAt: Date.now(), results });
  await row.save(null, { useMasterKey: true });
  return results;
});
