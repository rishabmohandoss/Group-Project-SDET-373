import HealthConnection from '@/components/health-connection';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { Page, s, serif, ink, blue } from '@/components/mise';
const readings = [
  ['☾ SLEEP SCORE','52','/100','Low','5h 48m · 3 wakeups',52,true],
  ['♡ RESTING HR','64','bpm','Above baseline','+6 vs your 58',78,true],
  ['♧ FERRITIN','18','ng/mL','Sample lab result','Lab panel · Aug 28',22,true],
  ['▱ BODY BATTERY','41','/100','Depleted','Sample recovery estimate',41,false],
] as const;
export default function Vitals() {
  return <Page>
    <Text style={s.title}>This morning’s{ '\n' }readings</Text>
    <HealthConnection/>
    <Text style={s.subtitle}>A preview of your overnight signals, and how they could inform the day ahead.</Text>
    <View style={{flexDirection:'row',justifyContent:'space-between',marginTop:8}}><Text style={s.label}>SOURCES · DEMO DATA</Text><Text style={[s.label,{color:blue,fontSize:9}]}>SAMPLE READINGS BELOW</Text></View>
    <View style={{borderTopWidth:1,borderTopColor:ink,paddingTop:16,flexDirection:'row',flexWrap:'wrap',gap:16}}>
      {readings.map(([label,value,unit,status,note,progress,flag]) => <View key={label} style={{width:'47%',gap:4}}>
        <Text style={[s.label,{fontSize:9,letterSpacing:0.7}]}>{label}</Text>
        <Text style={{fontFamily:serif,fontSize:31,fontWeight:'700',color:flag?'#C31865':ink}}>{value}<Text style={[s.small,{fontWeight:'400'}]}> {unit}</Text></Text>
        <View style={{height:3,backgroundColor:'#DCD7D4'}}><View style={{height:3,width:`${progress}%`,backgroundColor:flag?'#C31865':ink}}/></View>
        <Text style={[s.small,{color:flag?'#C31865':ink}]}>{status}</Text><Text style={[s.small,{marginTop:-5}]}>{note}</Text>
      </View>)}
    </View>
    <Text style={[s.label,{marginTop:12}]}>WHAT WE’D DO ABOUT IT</Text>
    <View style={s.rule}>
      <Text style={s.heading}>☕  A gentler morning.</Text>
      <Text style={s.body}>In this sample day, sleep was shorter than usual. The menu starts with an easy breakfast and leaves room for a slower pace.</Text>
      <Pressable accessibilityRole="button" onPress={() => router.navigate('/explore')} style={{paddingVertical:8}}><Text style={s.link}>Open the breakfast →</Text></Pressable>
    </View>
    <Text style={s.small}>Illustrative readings only. These are not your health results or a medical assessment.</Text>
  </Page>;
}

