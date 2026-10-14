import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Page, s, blue } from '@/components/mise';
import RecipeCard from '@/components/recipe-card';
import { usePlan } from '@/hooks/use-plan';
import { SLOTS } from '@/lib/plan';

export default function Plan() {
  const { plan, prefs, error, busy, reload, swap } = usePlan();
  return <Page>
    <Text style={s.title}>Today’s menu</Text>
    <Text style={s.subtitle}>{prefs ? `Chosen for a ${prefs.diet === 'anything' ? 'no-restrictions' : prefs.diet} diet${prefs.cuisines.length ? ` and your love of ${prefs.cuisines.join(', ')}` : ''}.` : 'Loading your preferences…'}</Text>
    {busy === 'all' && !plan ? <ActivityIndicator color={blue} /> : null}
    {error ? <Text accessibilityLiveRegion="polite" style={s.body}>{error}</Text> : null}
    {plan && SLOTS.map(slot => plan.meals[slot]
      ? <RecipeCard key={slot} recipe={plan.meals[slot]!} label={slot} swapping={busy === slot} onSwap={() => swap(slot)} />
      : <Text key={slot} style={s.body}>No {slot} recipe matched your preferences. Loosen them in the You tab.</Text>)}
    <Pressable accessibilityRole="button" onPress={reload}><Text style={s.link}>Build a fresh menu</Text></Pressable>
    <Text style={s.small}>Recipes from TheMealDB. Diet and avoided foods are checked against each ingredient list. Recipes do not include cost or cooking time.</Text>
  </Page>;
}
