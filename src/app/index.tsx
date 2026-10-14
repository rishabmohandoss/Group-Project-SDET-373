import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Action, Page, s, blue } from '@/components/mise';
import { registerPushToken, scheduleMealReminders, sendTestNotification } from '@/lib/notifications';

export default function Today() {
  const [feedback,setFeedback] = useState('');
  const [notice,setNotice] = useState('');
  useEffect(() => { scheduleMealReminders().catch(() => {}); registerPushToken().catch(() => {}); },[]);
  return <Page>
    <Text style={[s.small,{marginTop:-18}]}>Good morning. A little care, on your plate.</Text>
    <Text style={s.title}>Let’s put something{ '\n' }good on the table.</Text>
    <Text style={s.subtitle}>Built around your morning, your tastes, and the time you have. Nothing here takes long.</Text>
    <Action onPress={async () => setNotice(await sendTestNotification() ? 'Sent. Look for it in a second.' : 'Notifications are off. Enable them in Settings (not supported on web).')}>Send me a notification</Action>
    {!!notice && <Text accessibilityLiveRegion="polite" style={s.small}>{notice}</Text>}
    <Pressable accessibilityRole="button" onPress={() => router.navigate('/vitals')} style={[s.card,{flexDirection:'row',alignItems:'center',gap:12}]}>
      <Text style={{color:blue,fontSize:22}}>♧</Text><Text style={[s.small,{flex:1}]}>4 sample readings this morning — sleep, iron and heart rate shape this demo.</Text><Text style={s.link}>›</Text>
    </Pressable>
    <View style={[s.rule,{flexDirection:'row',borderBottomWidth:1,borderBottomColor:'#D9D5D1',paddingBottom:14}]}>
      {[['BUDGET','$6–12','per meal'],['WEEKNIGHT','30 min','time to cook'],['HEAT','Hot','spice ceiling']].map(([label,value,note]) => <View key={label} style={{flex:1,gap:5}}><Text style={s.label}>{label}</Text><Text style={s.heading}>{value}</Text><Text style={s.small}>{note}</Text></View>)}
    </View>
    <View style={s.card}>
      <Text style={s.label}>LAST NIGHT</Text>
      <Text style={s.heading}>Chicken Thighs, Sumac, Charred Lemon</Text>
      <Text style={s.body}>How was it? Tell us what you would like again.</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>
        {['♡ Loved it','♧ It was fine','♧ Not again'].map(option => <Pressable accessibilityRole="button" accessibilityState={{selected:feedback===option}} key={option} onPress={() => setFeedback(option)} style={{padding:10,backgroundColor:feedback===option?blue:'#E8E5E2'}}><Text style={[s.small,{color:feedback===option?'white':blue}]}>{option}</Text></Pressable>)}
      </View>
      {!!feedback && <Text accessibilityLiveRegion="polite" style={s.small}>Noted for this demo: {feedback.slice(2)}.</Text>}
    </View>
    <View style={s.rule}>
      <Text style={s.label}>ON THE MENU · DEMO PICKS</Text>
      <Text style={s.heading}>A softer start to the day.</Text>
      <Text style={s.body}>Warm oats, yogurt, berries and a handful of seeds. Simple ingredients, a little texture.</Text>
      <Pressable accessibilityRole="button" onPress={() => router.navigate('/explore')} style={{paddingVertical:8}}><Text style={s.link}>Open the breakfast →</Text></Pressable>
    </View>
  </Page>;
}

