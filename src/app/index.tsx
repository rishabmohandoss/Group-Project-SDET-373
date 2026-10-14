import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Action, Page, s, blue } from '@/components/mise';
import RecipeCard from '@/components/recipe-card';
import { usePlan } from '@/hooks/use-plan';
import { dayKey, loadPlan, recordFeedback, type Feedback } from '@/lib/plan';
import type { MealSlot, Recipe } from '@/lib/recipes';
import { startNotificationLogging } from '@/lib/notification-log';
import { registerPushToken, scheduleMealReminders, sendTestNotification } from '@/lib/notifications';

function nextSlot(): MealSlot { const h = new Date().getHours(); return h < 11 ? 'breakfast' : h < 16 ? 'lunch' : 'dinner'; }
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning.' : h < 18 ? 'Good afternoon.' : 'Good evening.'; };

export default function Today() {
  const { plan, prefs, error, busy } = usePlan();
  const [yesterday,setYesterday] = useState<Recipe | null>(null);
  const [feedback,setFeedback] = useState<Feedback['rating'] | ''>('');
  const [notice,setNotice] = useState('');
  useEffect(() => { scheduleMealReminders().catch(() => {}); registerPushToken().catch(() => {}); return startNotificationLogging(); },[]);
  useEffect(() => { const d = new Date(); d.setDate(d.getDate()-1); loadPlan(dayKey(d)).then(p => setYesterday(p?.meals.dinner ?? null)); },[]);
  const slot = nextSlot();
  const meal = plan?.meals[slot];
  const rate = async (rating: Feedback['rating']) => { if (!yesterday) return; setFeedback(rating); try { await recordFeedback(yesterday, rating); } catch { /* kept locally */ } };
  return <Page>
    <Text style={[s.small,{marginTop:-18}]}>{greeting()} A little care, on your plate.</Text>
    <Text style={s.title}>Let’s put something{ '\n' }good on the table.</Text>
    {prefs ? <View style={[s.rule,{flexDirection:'row',borderBottomWidth:1,borderBottomColor:'#D9D5D1',paddingBottom:14}]}>
      {[['DIET',prefs.diet === 'anything' ? 'Anything' : prefs.diet[0].toUpperCase()+prefs.diet.slice(1),'set in You'],['CUISINES',prefs.cuisines.length ? String(prefs.cuisines.length) : 'Any','you like'],['AVOID',prefs.avoid.length ? String(prefs.avoid.length) : 'None','foods']].map(([label,value,note]) => <View key={label} style={{flex:1,gap:5}}><Text style={s.label}>{label}</Text><Text style={s.heading}>{value}</Text><Text style={s.small}>{note}</Text></View>)}
    </View> : null}
    {busy === 'all' && !meal ? <ActivityIndicator color={blue} /> : null}
    {error ? <Text accessibilityLiveRegion="polite" style={s.body}>{error}</Text> : null}
    {meal ? <RecipeCard recipe={meal} label={`Next up · ${slot}`} /> : null}
    <Pressable accessibilityRole="button" onPress={() => router.navigate('/plan')}><Text style={s.link}>See today’s whole menu →</Text></Pressable>
    {yesterday ? <View style={s.card}>
      <Text style={s.label}>LAST NIGHT</Text>
      <Text style={s.heading}>{yesterday.name}</Text>
      <Text style={s.body}>How was it? Tell us what you would like again.</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
        {([['loved','♡ Loved it'],['fine','♧ It was fine'],['never','♧ Not again']] as const).map(([value,label]) => <Pressable accessibilityRole="button" accessibilityState={{selected:feedback===value}} key={value} onPress={() => rate(value)} style={{padding:10,backgroundColor:feedback===value?blue:'#E8E5E2'}}><Text style={[s.small,{color:feedback===value?'white':blue}]}>{label}</Text></Pressable>)}
      </View>
      {!!feedback && <Text accessibilityLiveRegion="polite" style={s.small}>Saved. We’ll use this for future menus.</Text>}
    </View> : null}
    <Action onPress={async () => setNotice(await sendTestNotification() ? 'Sent. Look for it in a second.' : 'Notifications are off. Enable them in Settings (not supported on web).')}>Send me a notification</Action>
    {!!notice && <Text accessibilityLiveRegion="polite" style={s.small}>{notice}</Text>}
    <Pressable accessibilityRole="button" onPress={() => router.navigate('/vitals')} style={[s.card,{flexDirection:'row',alignItems:'center',gap:12}]}>
      <Text style={{color:blue,fontSize:22}}>♧</Text><Text style={[s.small,{flex:1}]}>Vitals — sample readings until a wearable is connected.</Text><Text style={s.link}>›</Text>
    </Pressable>
  </Page>;
}
