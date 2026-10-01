import { serif } from '@/components/mise';
import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { deleteAccount, getProfile, signOut as logOut, type Profile } from '@/lib/account';


export default function AccountScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getProfile().then(next => { if (active) setProfile(next); })
        .catch(error => { if (active) setMessage(error instanceof Error ? error.message : 'Could not load profile.'); });
      return () => { active = false; };
    }, []),
  );

  const signOut = async () => {
    setBusy(true);
    try { await logOut(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not sign out.'); }
    finally { setBusy(false); }
  };

  const confirmDelete = () => {
    Alert.alert('Delete account?', 'This permanently removes your account and profile data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: runDelete },
    ]);
  };

  const runDelete = async () => {
    setBusy(true);
    try {
      await deleteAccount();
    } catch (error) {
      Alert.alert('Could not delete account', error instanceof Error ? error.message : 'Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.kicker}>MISE · YOUR PROFILE</Text>
            <Pressable onPress={() => router.navigate('/')}><Text style={styles.close}>Done</Text></Pressable>
          </View>
          <Text style={styles.title}>{profile ? profile?.display_name || 'Your profile' : 'Demo profile'}</Text>
          <Text style={styles.email}>{profile ? profile.email : 'Your personal edition, coming together.'}</Text>

          {message ? <Text style={styles.email}>{message}</Text> : null}
          <View style={styles.card}>
            <Text style={styles.cardKicker}>ACCOUNT STATUS</Text>
            <Text style={styles.cardTitle}>{profile ? 'Account connected' : 'Demo mode'}</Text>
            <Text style={styles.cardBody}>{profile ? 'Your profile is saved to your account. Wearable readings and menus are still demo data.' : 'You’re exploring a sample profile. No wearable is connected, and all readings are illustrative.'}</Text>
          </View>

          {profile ? (
            <>
              <View style={styles.card}>
                <Text style={styles.cardKicker}>{profile.profileDataSource === 'demo' ? 'SAMPLE PROFILE · FICTIONAL DETAILS' : 'PROFILE DETAILS'}</Text>
                <Text style={styles.cardBody}>Age: {profile.age ?? 'Not set'} · Sex: {profile.sex ?? 'Not set'}</Text>
                <Text style={styles.cardBody}>Weight: {profile.weightKg != null ? `${profile.weightKg} kg` : 'Not set'}</Text>
                <Text style={styles.cardTitle}>{profile.device?.model ?? 'No device added'}</Text>
                <Text style={styles.cardBody}>{profile.device?.isConnected ? 'Connected' : 'No wearable connected'}</Text>
                {profile.preferences ? <>
                  <Text style={styles.cardBody}>Diet: {profile.preferences.diet}</Text>
                  <Text style={styles.cardBody}>Favorites: {profile.preferences.favoriteCuisines.join(', ')}</Text>
                  <Text style={styles.cardBody}>Avoid: {profile.preferences.dislikedFoods.join(', ')}</Text>
                  <Text style={styles.cardBody}>${profile.preferences.mealBudgetMin}–{profile.preferences.mealBudgetMax} {profile.preferences.currency} per meal · {profile.preferences.maxCookingMinutes} min · {profile.preferences.spiceLevel}</Text>
                  <Text style={styles.cardBody}>Goals: {profile.preferences.goals.join(', ')}</Text>
                </> : null}
                {profile.profileDataSource === 'demo' ? <Text style={styles.cardBody}>These sample details were saved with your account for the demo. They do not describe you or a real device connection.</Text> : null}
              </View>
              <Pressable onPress={signOut} disabled={busy} style={styles.secondaryButton}><Text style={styles.secondaryText}>Sign out</Text></Pressable>
              <Pressable onPress={confirmDelete} disabled={busy} style={styles.deleteButton}>
                {busy ? <ActivityIndicator color="#B44E42" /> : <Text style={styles.deleteText}>Delete account</Text>}
              </Pressable>
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F2F0' },
  safeArea: { flex: 1 },
  content: { padding: 20, paddingTop: 18, gap: 14 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { color: '#008BAD', fontFamily: serif, fontSize: 11, fontWeight: '900', letterSpacing: 1.4 },
  close: { color: '#008BAD', fontFamily: serif, fontSize: 14, fontWeight: '800' },
  title: { color: '#292725', fontFamily: serif, fontSize: 34, fontWeight: '900', marginTop: 18 },
  email: { color: '#817D79', fontFamily: serif, fontSize: 15, marginTop: -6 },
  card: { backgroundColor: '#FAF8F6', borderRadius: 0, padding: 20, gap: 7, marginTop: 14 },
  cardKicker: { color: '#008BAD', fontFamily: serif, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  cardTitle: { color: '#292725', fontFamily: serif, fontSize: 21, fontWeight: '900' },
  cardBody: { color: '#817D79', fontFamily: serif, fontSize: 14, lineHeight: 21 },
  secondaryButton: { height: 54, borderRadius: 0, backgroundColor: '#292725', alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: '#FAF8F6', fontFamily: serif, fontSize: 15, fontWeight: '900' },
  deleteButton: { minHeight: 48, borderRadius: 0, borderWidth: 1, borderColor: '#E1B2AA', alignItems: 'center', justifyContent: 'center' },
  deleteText: { color: '#B44E42', fontFamily: serif, fontSize: 14, fontWeight: '800' },
});
