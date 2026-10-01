import { DefaultTheme, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthScreen from '@/components/auth-screen';
import AppTabs from '@/components/app-tabs';
import { Action, s, paper, blue, serif, ink } from '@/components/mise';
import { backendConfigured } from '@/lib/back4app';
import { getProfile, onAccountChange, type Profile } from '@/lib/account';

export default function Layout() {
  const [session,setSession] = useState<Profile | null>(null);
  const [loading,setLoading] = useState(backendConfigured);
  const [screen,setScreen] = useState<'welcome'|'auth'|'app'>('welcome');
  useEffect(() => {
    if (!backendConfigured) return;
    let active = true;
    let changed = false;
    const unsubscribe = onAccountChange(next => {
      changed = true;
      setSession(next); setLoading(false);
      if (!next) setScreen('welcome');
    });
    getProfile().then(profile => { if(active && !changed) setSession(profile); })
      .catch(() => { /* Keep sign-in and demo available if the network is offline. */ })
      .finally(() => { if(active) setLoading(false); });
    return () => {active=false;unsubscribe();};
  },[]);
  return <ThemeProvider value={{...DefaultTheme,colors:{...DefaultTheme.colors,background:paper,card:paper,primary:blue}}}>
    <StatusBar style="dark"/>
    {loading ? <View style={{flex:1,backgroundColor:paper,justifyContent:'center'}}><ActivityIndicator color={blue}/></View>
      : session || screen === 'app' ? <AppTabs/>
      : screen === 'auth' ? <AuthScreen onContinueDemo={() => setScreen('app')}/>
      : <SafeAreaView style={styles.welcome}>
        <View style={styles.inner}>
          <Text style={[s.label,{color:blue,fontSize:9}]}>EST. 2026 · DAILY EDITION</Text>
          <Text style={styles.logo}>MISE</Text>
          <Text style={[s.subtitle,{color:ink,fontSize:21,lineHeight:28}]}>Good food, picked for you. Every day.</Text>
          <Text style={[s.body,{marginTop:20,maxWidth:300}]}>Tell us how you like to eat and what you would rather avoid. Every morning we put together a short menu just for you — a few things to cook, a few things worth ordering.</Text>
          <Text style={[s.body,{marginTop:8}]}>Takes about two minutes to set up.</Text>
          <View style={{flex:1,minHeight:100}}/>
          <Action onPress={() => setScreen(backendConfigured ? 'auth':'app')}>Let’s get started</Action>
          <Pressable accessibilityRole="button" style={{padding:22,alignItems:'center'}} onPress={() => setScreen('auth')}><Text style={s.link}>I already have a profile</Text></Pressable>
          <Text style={[s.small,{textAlign:'center'}]}>Demo edition · Sample readings and menus</Text>
        </View>
      </SafeAreaView>}
  </ThemeProvider>;
}
const styles = StyleSheet.create({
  welcome:{flex:1,backgroundColor:paper},
  inner:{flex:1,padding:28,paddingTop:42,width:'100%',maxWidth:500,alignSelf:'center'},
  logo:{fontFamily:serif,fontSize:60,letterSpacing:5,fontWeight:'700',color:ink,marginTop:12,marginBottom:10},
});

