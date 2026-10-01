import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { Page, s, blue } from '@/components/mise';
const items=['Rolled oats','Plain yogurt','Mixed berries','Pumpkin seeds','Chickpeas','Leafy greens','Chicken thighs','Lemons','Sumac'];
export default function List(){const [checked,setChecked]=useState<string[]>([]);return <Page><Text style={s.title}>A short list.{ '\n' }A good week.</Text><Text style={s.subtitle}>For your demo menu. Tap as you shop.</Text><Text style={s.label}>{checked.length} OF {items.length} IN YOUR BASKET</Text>{items.map(item=><Pressable key={item} accessibilityRole="checkbox" accessibilityState={{checked:checked.includes(item)}} onPress={()=>setChecked(checked.includes(item)?checked.filter(x=>x!==item):[...checked,item])} style={[s.rule,{paddingBottom:8}]}><Text style={[s.body,{color:checked.includes(item)?blue:'#292725',textDecorationLine:checked.includes(item)?'line-through':'none'}]}>{checked.includes(item)?'☑':'□'}   {item}</Text></Pressable>)}</Page>;}

