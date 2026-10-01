import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { s, blue } from './mise';
import { healthAvailabilityMessage, readAppleHealth } from '@/services/apple-health';
import { healthUser, loadHealthSnapshot, saveHealthSnapshot, removeHealthSnapshot } from '@/lib/health-account';
import type { HealthSnapshot } from '@/lib/health-data';

export default function HealthConnection() {
  const [snapshot,setSnapshot] = useState<HealthSnapshot | null>(null);
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState('');
  useFocusEffect(useCallback(() => {
    let active = true;
    loadHealthSnapshot().then(value => {if(active)setSnapshot(value);})
      .catch(error => {if(active)setMessage(error instanceof Error ? error.message : 'Unable to load readings.');});
    return () => {active=false;};
  },[]));
  const sync = async () => {
    if (busy) return;
    setBusy(true);setMessage('');
    try {
      const user = await healthUser();
      const next = await readAppleHealth();
      if (next.steps === null && next.restingHeartRate === null && next.sleepMinutes === null) {
        setMessage('No readable data found. Check MISE permissions in Apple Health and let your wearable finish syncing. Apple does not reveal whether read access was denied.');
        return;
      }
      await saveHealthSnapshot(next,user.id!);
      setSnapshot(next);setMessage('Readings saved to your account.');
    } catch(error) {setMessage(error instanceof Error ? error.message : 'Sync failed. Try again.');}
    finally {setBusy(false);}
  };
  const remove = async () => {
    setBusy(true);
    try {await removeHealthSnapshot();setSnapshot(null);setMessage('Saved readings removed. Manage MISE permissions in Apple Health to revoke access.');}
    catch(error) {setMessage(error instanceof Error ? error.message : 'Unable to remove readings.');}
    finally {setBusy(false);}
  };
  return <View style={s.card}>
    <Text style={s.label}>YOUR WEARABLES · APPLE HEALTH</Text>
    <Text style={s.heading}>Apple Watch and compatible apps</Text>
    <Text style={s.body}>Reads steps, resting heart rate, and sleep from Apple Health. WHOOP can contribute supported readings when Apple Health sharing is enabled in the WHOOP app.</Text>
    {snapshot ? <View style={{gap:6}}>
      <Text style={s.label}>SAVED READINGS · {new Date(snapshot.syncedAt).toLocaleString()}</Text>
      <Text style={s.body}>Steps: {snapshot.steps ?? 'Unavailable'} · {snapshot.stepSource ?? 'No step source'}</Text>
      <Text style={s.body}>Resting heart rate: {snapshot.restingHeartRate != null ? `${Math.round(snapshot.restingHeartRate)} bpm` : 'Unavailable'}</Text>
      <Text style={s.body}>Sleep: {snapshot.sleepMinutes != null ? `${Math.floor(snapshot.sleepMinutes/60)}h ${snapshot.sleepMinutes%60}m` : 'Unavailable'} in the 24 hours before sync</Text>
      <Text style={s.small}>Sources: {snapshot.sources.join(', ') || 'Apple Health'}. Steps use the source with the highest daily total to avoid adding overlapping device counts. Refresh manually for new readings.</Text>
    </View> : null}
    <Text style={s.small}>By tapping below, you choose to read the permitted data and upload this summary to your MISE account in Back4App. No raw samples are uploaded.</Text>
    {healthAvailabilityMessage ? <Text style={s.body}>{healthAvailabilityMessage}</Text> : <Pressable accessibilityRole="button" disabled={busy} onPress={sync} style={s.button}>
      {busy ? <ActivityIndicator color="white"/> : <Text style={s.buttonText}>Read and save to my account</Text>}
    </Pressable>}
    {message ? <Text accessibilityLiveRegion="polite" style={s.small}>{message}</Text> : null}
    {snapshot ? <Pressable disabled={busy} onPress={remove}><Text style={[s.link,{color:blue}]}>Remove saved readings</Text></Pressable> : null}
  </View>;
}
