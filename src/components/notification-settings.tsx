import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { serif } from '@/components/mise';
import { DEFAULT_SETTINGS, MEAL_LABELS, formatTime, loadSettings, saveSettings, sendTestNotification, type MealId, type NotificationSettings } from '@/lib/notifications';

const blue = '#008BAD';

export default function NotificationSettingsCard() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [note, setNote] = useState('');
  useEffect(() => { loadSettings().then(setSettings); }, []);

  const update = (next: NotificationSettings) => {
    setSettings(next);
    saveSettings(next).then(() => setNote('Saved. Reminders updated.')).catch(() => setNote('Could not update reminders. Check notification permission.'));
  };
  const shift = (id: MealId, delta: number) => {
    const minutes = (settings.meals[id].minutes + delta + 1440) % 1440;
    update({ ...settings, meals: { ...settings.meals, [id]: { ...settings.meals[id], minutes } } });
  };

  return (
    <View style={styles.card}>
      <Text style={styles.kicker}>NOTIFICATIONS</Text>
      <View style={styles.row}>
        <Text style={styles.title}>Meal reminders</Text>
        <Switch value={settings.enabled} onValueChange={enabled => update({ ...settings, enabled })} trackColor={{ true: blue }} />
      </View>
      {settings.enabled ? <>
        {(Object.keys(MEAL_LABELS) as MealId[]).map(id => {
          const meal = settings.meals[id];
          return (
            <View key={id} style={{ gap: 8 }}>
              <View style={styles.row}>
                <Switch value={meal.enabled} onValueChange={enabled => update({ ...settings, meals: { ...settings.meals, [id]: { ...meal, enabled } } })} trackColor={{ true: blue }} />
                <Text style={[styles.body, { flex: 1, marginLeft: 10, opacity: meal.enabled ? 1 : 0.5 }]}>{MEAL_LABELS[id]}</Text>
                <Text style={[styles.time, { opacity: meal.enabled ? 1 : 0.5 }]}>{formatTime(meal.minutes)}</Text>
              </View>
              {meal.enabled ? <View style={[styles.row, { justifyContent: 'flex-end', gap: 6 }]}>
                {([['−1 hr', -60], ['+1 hr', 60], ['−1 min', -1], ['+1 min', 1]] as const).map(([label, delta]) => (
                  <Pressable key={label} accessibilityLabel={`${label} ${MEAL_LABELS[id]}`} onPress={() => shift(id, delta)} style={styles.step}><Text style={styles.stepText}>{label}</Text></Pressable>
                ))}
              </View> : null}
            </View>
          );
        })}
        <View style={styles.row}>
          <Text style={styles.body}>Play sound</Text>
          <Switch value={settings.sound} onValueChange={sound => update({ ...settings, sound })} trackColor={{ true: blue }} />
        </View>
        <Pressable onPress={async () => setNote((await sendTestNotification()) ? 'Test sent.' : 'Notifications are off for MISE. Enable them in Settings.')}>
          <Text style={styles.link}>Send a test notification</Text>
        </Pressable>
      </> : null}
      {note ? <Text style={styles.body}>{note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#FAF8F6', padding: 20, gap: 12, marginTop: 14 },
  kicker: { color: blue, fontFamily: serif, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: '#292725', fontFamily: serif, fontSize: 21, fontWeight: '900' },
  body: { color: '#817D79', fontFamily: serif, fontSize: 14, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  time: { color: '#292725', fontFamily: serif, fontSize: 14, fontWeight: '700', minWidth: 76, textAlign: 'center' },
  step: { paddingHorizontal: 10, height: 34, backgroundColor: '#E8E5E2', alignItems: 'center', justifyContent: 'center' },
  stepText: { color: blue, fontSize: 13, fontWeight: '700' },
  link: { color: blue, fontFamily: serif, fontSize: 14, fontWeight: '600' },
});
