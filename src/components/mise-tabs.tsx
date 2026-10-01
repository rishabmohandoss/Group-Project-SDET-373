import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { blue, muted, paper, serif } from './mise';
const tabs = [
  ['index', 'TODAY', '▣'], ['vitals', 'VITALS', '∿'], ['explore', 'DISCOVER', '♡'],
  ['plan', 'PLAN', '▤'], ['list', 'LIST', '▥'], ['account', 'YOU', '◎'],
];
export default function MiseTabs() {
  return <Tabs screenOptions={{
    headerShown:false, tabBarActiveTintColor:blue, tabBarInactiveTintColor:muted,
    tabBarStyle:{backgroundColor:paper,borderTopColor:'#77716C',borderTopWidth:1,elevation:0},
    tabBarLabelStyle:{fontFamily:serif,fontSize:8,letterSpacing:0.5},
    sceneStyle:{backgroundColor:paper},
  }}>
    {tabs.map(([name,title,icon]) => <Tabs.Screen key={name} name={name} options={{
      title,tabBarIcon:({color}) => <Text style={{color,fontSize:23}}>{icon}</Text>,
    }}/>)}
  </Tabs>;
}

