import { useState } from 'react';
import { ActivityIndicator, Image, Linking, Pressable, Text, View } from 'react-native';
import { s, blue } from '@/components/mise';
import type { Recipe } from '@/lib/recipes';

export default function RecipeCard({ recipe, label, onSwap, swapping }: { recipe: Recipe; label?: string; onSwap?: () => void; swapping?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.rule}>
      {label ? <Text style={s.label}>{label.toUpperCase()} · {recipe.area.toUpperCase()} · {recipe.category.toUpperCase()}</Text> : null}
      {recipe.image ? <Image source={{ uri: recipe.image }} style={{ width: '100%', height: 180 }} accessibilityLabel={recipe.name} /> : null}
      <Text style={s.heading}>{recipe.name}</Text>
      <View style={{ flexDirection: 'row', gap: 18 }}>
        <Pressable accessibilityRole="button" onPress={() => setOpen(!open)}><Text style={s.link}>{open ? 'Hide recipe' : 'Show recipe'}</Text></Pressable>
        {onSwap ? <Pressable accessibilityRole="button" disabled={swapping} onPress={onSwap}>{swapping ? <ActivityIndicator color={blue} /> : <Text style={s.link}>Swap for another</Text>}</Pressable> : null}
      </View>
      {open ? <>
        <Text style={s.label}>INGREDIENTS</Text>
        <Text style={s.body}>{recipe.ingredients.map(i => `${i.measure ? i.measure + ' ' : ''}${i.name}`).join('\n')}</Text>
        <Text style={s.label}>HOW TO MAKE IT</Text>
        <Text style={s.body}>{recipe.instructions}</Text>
        {recipe.source ? <Pressable onPress={() => Linking.openURL(recipe.source!)}><Text style={s.link}>Original recipe →</Text></Pressable> : null}
        {recipe.video ? <Pressable onPress={() => Linking.openURL(recipe.video!)}><Text style={s.link}>Watch on YouTube →</Text></Pressable> : null}
      </> : null}
    </View>
  );
}
