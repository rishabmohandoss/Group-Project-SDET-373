import { useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Page, s, blue } from '@/components/mise';
import RecipeCard from '@/components/recipe-card';
import { findNearby, type Place } from '@/lib/nearby';
import { loadPreferences } from '@/lib/preferences';
import { fits, search, type Recipe } from '@/lib/recipes';

export default function Discover() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Recipe[] | null>(null);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [busy, setBusy] = useState<'search' | 'places' | null>(null);
  const [error, setError] = useState('');

  const runSearch = async () => {
    if (!query.trim()) return;
    setBusy('search'); setError('');
    try {
      const prefs = await loadPreferences();
      setResults((await search(query.trim())).filter(r => fits(r, prefs)));
    } catch (e) { setError(e instanceof Error ? e.message : 'Search failed.'); }
    finally { setBusy(null); }
  };
  const runNearby = async () => {
    setBusy('places'); setError('');
    try { setPlaces(await findNearby(await loadPreferences())); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not find places.'); }
    finally { setBusy(null); }
  };
  const openMap = (p: Place) => Linking.openURL(Platform.OS === 'ios' ? `http://maps.apple.com/?ll=${p.lat},${p.lon}&q=${encodeURIComponent(p.name)}` : `geo:${p.lat},${p.lon}?q=${p.lat},${p.lon}(${encodeURIComponent(p.name)})`);

  return <Page>
    <Text style={s.title}>Find something{ '\n' }worth eating.</Text>
    <View style={s.rule}>
      <Text style={s.label}>SEARCH RECIPES</Text>
      <TextInput value={query} onChangeText={setQuery} onSubmitEditing={runSearch} returnKeyType="search" placeholder="chicken, lentil, pasta…" style={{ borderWidth: 1, borderColor: '#D9D5D1', padding: 10, backgroundColor: 'white' }} />
      <Pressable accessibilityRole="button" onPress={runSearch}><Text style={s.link}>Search</Text></Pressable>
      {busy === 'search' ? <ActivityIndicator color={blue} /> : null}
      {results?.length === 0 ? <Text style={s.body}>Nothing matched your diet and avoided foods. Try another search.</Text> : null}
      {results?.map(r => <RecipeCard key={r.id} recipe={r} label="recipe" />)}
    </View>
    <View style={s.rule}>
      <Text style={s.label}>EAT OUT · NEAR YOU</Text>
      <Text style={s.body}>Restaurants and cafes within about 1.5 km of where you are, with your diet and cuisines ranked first.</Text>
      <Pressable accessibilityRole="button" onPress={runNearby}><Text style={s.link}>{places ? 'Refresh places near me' : 'Find places near me'}</Text></Pressable>
      {busy === 'places' ? <ActivityIndicator color={blue} /> : null}
      {places?.length === 0 ? <Text style={s.body}>No named restaurants found nearby in OpenStreetMap.</Text> : null}
      {places?.map(p => <Pressable key={p.id} accessibilityRole="button" onPress={() => openMap(p)} style={{ paddingVertical: 6 }}>
        <Text style={s.heading}>{p.name}</Text>
        <Text style={s.small}>{[p.kind, p.cuisine, `${p.meters} m`, p.dietMatch ? 'matches your diet' : null].filter(Boolean).join(' · ')}</Text>
      </Pressable>)}
    </View>
    {error ? <Text accessibilityLiveRegion="polite" style={s.body}>{error}</Text> : null}
    <Text style={s.small}>Recipes from TheMealDB, places from OpenStreetMap. Prices and opening hours are not available from these free sources.</Text>
  </Page>;
}
