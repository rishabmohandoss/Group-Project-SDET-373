import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { serif } from '@/components/mise';
import { CUISINES, DEFAULT_PREFERENCES, DIETS, loadPreferences, savePreferences, type FoodPreferences } from '@/lib/preferences';
import { today } from '@/lib/plan';
import AsyncStorage from '@react-native-async-storage/async-storage';

const blue = '#008BAD';

export default function PreferencesCard() {
  const [prefs, setPrefs] = useState<FoodPreferences>(DEFAULT_PREFERENCES);
  const [avoid, setAvoid] = useState('');
  const [note, setNote] = useState('');
  useEffect(() => { loadPreferences().then(p => { setPrefs(p); setAvoid(p.avoid.join(', ')); }); }, []);

  const update = async (next: FoodPreferences) => {
    setPrefs(next);
    try {
      await savePreferences(next);
      await AsyncStorage.removeItem(`mise.plan.${today()}`); // menu rebuilds with the new tastes
      setNote('Saved. Your menu will update.');
    } catch { setNote('Saved on this phone. Could not reach your account.'); }
  };
  const chip = (label: string, on: boolean, onPress: () => void) => (
    <Pressable key={label} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={onPress} style={[styles.chip, on && { backgroundColor: blue }]}>
      <Text style={[styles.chipText, on && { color: 'white' }]}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>FOOD PREFERENCES</Text>
      <Text style={styles.label}>Diet</Text>
      <View style={styles.wrap}>{DIETS.map(d => chip(d.label, prefs.diet === d.id, () => update({ ...prefs, diet: d.id })))}</View>
      <Text style={styles.label}>Cuisines you like</Text>
      <View style={styles.wrap}>{CUISINES.map(c => chip(c, prefs.cuisines.includes(c), () => update({ ...prefs, cuisines: prefs.cuisines.includes(c) ? prefs.cuisines.filter(x => x !== c) : [...prefs.cuisines, c] })))}</View>
      <Text style={styles.label}>Longest you will cook</Text>
      <View style={styles.wrap}>{[[0, 'No limit'], [15, '15 min'], [30, '30 min'], [45, '45 min'], [60, '1 hr']].map(([m, l]) => chip(String(l), prefs.maxMinutes === m, () => update({ ...prefs, maxMinutes: Number(m) })))}</View>
      <Text style={styles.label}>Budget per serving</Text>
      <View style={styles.wrap}>{[[0, 'No limit'], [3, '$3'], [5, '$5'], [8, '$8'], [12, '$12']].map(([m, l]) => chip(String(l), prefs.maxPrice === m, () => update({ ...prefs, maxPrice: Number(m) })))}</View>
      <Text style={styles.body}>Cook time and budget apply to personalised recipes, which need you to be signed in.</Text>
      <Text style={styles.label}>Foods to avoid (comma separated)</Text>
      <TextInput value={avoid} onChangeText={setAvoid} onEndEditing={() => update({ ...prefs, avoid: avoid.split(',').map(x => x.trim()).filter(Boolean) })} placeholder="mushrooms, peanuts" style={styles.input} autoCapitalize="none" />
      {note ? <Text style={styles.body}>{note}</Text> : null}
    </View>
  );
}
const styles = StyleSheet.create({
  card: { backgroundColor: '#FAF8F6', padding: 20, gap: 10, marginTop: 14 },
  kicker: { color: blue, fontFamily: serif, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  label: { color: '#292725', fontFamily: serif, fontSize: 14, fontWeight: '700', marginTop: 4 },
  body: { color: '#817D79', fontFamily: serif, fontSize: 13 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#E8E5E2' },
  chipText: { color: blue, fontFamily: serif, fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#D9D5D1', padding: 10, fontFamily: serif, fontSize: 14, backgroundColor: 'white' },
});
