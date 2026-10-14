import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import { Page, s, blue } from '@/components/mise';
import { usePlan } from '@/hooks/use-plan';
import { SLOTS } from '@/lib/plan';

export default function List() {
  const { plan, busy } = usePlan();
  const [checked, setChecked] = useState<string[]>([]);
  const key = plan ? `mise.list.${plan.date}` : null;
  useEffect(() => { if (key) AsyncStorage.getItem(key).then(v => setChecked(v ? JSON.parse(v) : [])); }, [key]);
  const items = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const slot of SLOTS) for (const i of plan?.meals[slot]?.ingredients ?? []) {
      const k = i.name.toLowerCase();
      map.set(k, [...(map.get(k) ?? []), i.measure].filter(Boolean));
    }
    return [...map.entries()].map(([name, measures]) => ({ name, measures })).sort((a, b) => a.name.localeCompare(b.name));
  }, [plan]);
  const toggle = (name: string) => {
    const next = checked.includes(name) ? checked.filter(x => x !== name) : [...checked, name];
    setChecked(next); if (key) AsyncStorage.setItem(key, JSON.stringify(next));
  };
  return <Page>
    <Text style={s.title}>Shopping list</Text>
    <Text style={s.subtitle}>Everything in today’s menu. Tap as you shop.</Text>
    {busy === 'all' && !plan ? <ActivityIndicator color={blue} /> : null}
    {items.map(({ name, measures }) => <Pressable key={name} accessibilityRole="checkbox" accessibilityState={{ checked: checked.includes(name) }} onPress={() => toggle(name)} style={[s.rule, { flexDirection: 'row', gap: 12 }]}>
      <Text style={{ color: blue, fontSize: 18 }}>{checked.includes(name) ? '☑' : '☐'}</Text>
      <Text style={[s.body, { flex: 1, textDecorationLine: checked.includes(name) ? 'line-through' : 'none' }]}>{name}{measures.length ? ` · ${measures.join(' + ')}` : ''}</Text>
    </Pressable>)}
    {plan && !items.length ? <Text style={s.body}>Your menu is empty. Open the Plan tab to build one.</Text> : null}
  </Page>;
}
