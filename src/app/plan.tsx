import { Text, View } from 'react-native';
import { Page, s } from '@/components/mise';
export default function Plan(){return <Page><Text style={s.title}>A little less{ '\n' }“what’s for dinner?”</Text><Text style={s.subtitle}>Your sample menu for today. Simple by design.</Text>{[['MORNING · 12 MIN','Warm oats, berries & seeds'],['MIDDAY · 20 MIN','Chickpeas, greens & lemon'],['EVENING · 30 MIN','Chicken, sumac & charred lemon']].map(([time,meal])=><View key={time} style={s.rule}><Text style={s.label}>{time}</Text><Text style={s.heading}>{meal}</Text></View>)}</Page>;}

