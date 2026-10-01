import { serif } from '@/components/mise';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { signUp, signIn, resetPassword } from '@/lib/account';
import { backendConfigured } from '@/lib/back4app';

type Mode = 'signIn' | 'signUp';

type AuthScreenProps = {
  onContinueDemo?: () => void;
};

export default function AuthScreen({ onContinueDemo }: AuthScreenProps) {
  const [mode, setMode] = useState<Mode>('signUp');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    setMessage('');
    if (!backendConfigured) { setMessage('Accounts are not available in this demo yet. Continue below to explore MISE.'); return; }
    if (!email.trim() || password.length < 6 || (mode === 'signUp' && !name.trim())) {
      setMessage(mode === 'signUp' ? 'Add your name, email, and a password with 6+ characters.' : 'Enter your email and password.');
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signUp') {
        await signUp(email, password, name);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  const forgotPassword = async () => {
    if (!backendConfigured) { setMessage('Account setup is not complete yet.'); return; }
    if (!email.trim()) { setMessage('Enter your email address first.'); return; }
    setBusy(true);
    try {
      await resetPassword(email);
      setMessage('Check your email for a password reset link.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send the reset email.');
    } finally { setBusy(false); }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        <Text style={styles.kicker}>EST. 2026 · DAILY EDITION</Text>
        <Text style={styles.title}>MISE</Text>
        <Text style={styles.subtitle}>Good food, picked for you. Every day.</Text>

        <View style={styles.formCard}>
          <View style={styles.modeRow}>
            <Pressable onPress={() => { setMode('signUp'); setMessage(''); }} style={[styles.modeButton, mode === 'signUp' && styles.modeButtonActive]}>
              <Text style={[styles.modeText, mode === 'signUp' && styles.modeTextActive]}>Create account</Text>
            </Pressable>
            <Pressable onPress={() => { setMode('signIn'); setMessage(''); }} style={[styles.modeButton, mode === 'signIn' && styles.modeButtonActive]}>
              <Text style={[styles.modeText, mode === 'signIn' && styles.modeTextActive]}>Sign in</Text>
            </Pressable>
          </View>

          {mode === 'signUp' ? <Text style={styles.legal}>Demo accounts include fictional age, sex, weight, device, and food preferences saved to your profile.</Text> : null}
          {mode === 'signUp' ? <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor="#839087" style={styles.input} autoCapitalize="words" /> : null}
          <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#839087" style={styles.input} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#839087" style={styles.input} secureTextEntry autoComplete={mode === 'signUp' ? 'new-password' : 'password'} />

          {message ? <Text style={styles.message}>{message}</Text> : null}
          <Pressable onPress={submit} disabled={busy} style={({ pressed }) => [styles.submit, pressed && styles.pressed]}>
            {busy ? <ActivityIndicator color="#292725" /> : <Text style={styles.submitText}>{mode === 'signUp' ? 'Create my account' : 'Continue'}</Text>}
          </Pressable>
          {mode === 'signIn' && <Pressable disabled={busy} onPress={forgotPassword} style={styles.demoButton}><Text style={styles.demoText}>Forgot password?</Text></Pressable>}
          <Text style={styles.legal}>By continuing, you agree to use this app for wellness guidance, not medical diagnosis.</Text>
          {onContinueDemo ? (
            <Pressable onPress={onContinueDemo} style={styles.demoButton}>
              <Text style={styles.demoText}>Preview demo without an account</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F2F0' },
  content: { flexGrow: 1, padding: 24, paddingTop: 72, paddingBottom: 40, justifyContent: 'center' },
  mark: { width: 48, height: 48, borderRadius: 0, backgroundColor: '#008BAD', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  markText: { color: '#292725', fontFamily: serif, fontSize: 32, lineHeight: 38, fontWeight: '300' },
  kicker: { color: '#008BAD', fontFamily: serif, fontSize: 11, fontWeight: '900', letterSpacing: 1.4, marginBottom: 12 },
  title: { color: '#292725', fontFamily: serif, fontSize: 42, lineHeight: 43, fontWeight: '900', letterSpacing: -1.5 },
  subtitle: { color: '#817D79', fontFamily: serif, fontSize: 16, lineHeight: 24, marginTop: 16, maxWidth: 420 },
  formCard: { backgroundColor: '#FAF8F6', borderRadius: 0, padding: 18, marginTop: 28, gap: 12 },
  modeRow: { flexDirection: 'row', backgroundColor: '#F0F3EE', borderRadius: 0, padding: 4, marginBottom: 2 },
  modeButton: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 0 },
  modeButtonActive: { backgroundColor: '#292725' },
  modeText: { color: '#817D79', fontFamily: serif, fontSize: 13, fontWeight: '800' },
  modeTextActive: { color: '#FAF8F6' },
  input: { height: 52, borderRadius: 0, backgroundColor: '#F4F2F0', paddingHorizontal: 15, color: '#292725', fontFamily: serif, fontSize: 15 },
  message: { color: '#B44E42', fontFamily: serif, fontSize: 13, lineHeight: 18 },
  submit: { minHeight: 54, borderRadius: 0, backgroundColor: '#008BAD', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  submitText: { color: '#FFFFFF', fontFamily: serif, fontSize: 15, fontWeight: '900' },
  legal: { color: '#89948C', fontFamily: serif, fontSize: 11, lineHeight: 16, textAlign: 'center', paddingHorizontal: 8 },
  demoButton: { alignItems: 'center', paddingVertical: 4 },
  demoText: { color: '#008BAD', fontFamily: serif, fontSize: 13, fontWeight: '800' },
  pressed: { opacity: 0.78 },
});
