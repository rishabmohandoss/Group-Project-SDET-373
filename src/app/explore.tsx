import { useState } from 'react';
import { Text, View } from 'react-native';
import { Page, s, Action } from '@/components/mise';
export default function Discover() {
 const [saved,setSaved] = useState(false);
 return <Page><Text style={s.title}>Something worth{ '\n' }making.</Text><Text style={s.subtitle}>A small collection for your everyday table.</Text>
 <View style={s.rule}><Text style={s.label}>BREAKFAST · 12 MINUTES · $4</Text><Text style={s.heading}>Warm oats, berries & toasted seeds</Text><Text style={s.body}>Creamy oats with yogurt, fresh berries and pumpkin seeds. A little honey, if you like.</Text>
 <Text style={s.label}>FOR ONE</Text><Text style={s.body}>½ cup rolled oats{ '\n' }¾ cup milk of your choice{ '\n' }¼ cup plain yogurt{ '\n' }A handful of berries and pumpkin seeds</Text>
 <Text style={s.label}>HOW TO MAKE IT</Text><Text style={s.body}>Simmer the oats and milk for 5–7 minutes. Spoon into a bowl, add yogurt and berries, then scatter the seeds on top.</Text>
 <Action onPress={() => setSaved(!saved)}>{saved?'Saved for this session ✓':'Save this breakfast'}</Action></View>
 <View style={s.rule}><Text style={s.label}>DINNER · 30 MINUTES · $9</Text><Text style={s.heading}>Chicken, sumac & charred lemon</Text><Text style={s.body}>A bright, warming dinner with a crisp green salad on the side.</Text></View>
 <Text style={s.small}>Demo menu · Adapt ingredients to your dietary needs.</Text></Page>;
}

