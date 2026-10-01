import type { PropsWithChildren } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ink = '#292725';
export const paper = '#F4F2F0';
export const blue = '#008BAD';
export const muted = '#817D79';
export const serif = Platform.OS === 'ios' ? 'Georgia' : Platform.OS === 'web' ? 'Georgia, serif' : 'serif';

export function Page({ children }: PropsWithChildren) {
  return <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: paper }}>
    <ScrollView contentContainerStyle={s.page}>
      <View style={s.masthead}><Text style={s.brand}>MISE</Text><Text style={s.label}>{new Date().toLocaleDateString('en-US', {weekday:'short',month:'short',day:'numeric'}).toUpperCase()}</Text></View>
      {children}
    </ScrollView>
  </SafeAreaView>;
}
export function Action({ children, onPress }: PropsWithChildren<{onPress: () => void}>) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={({pressed}) => [s.button, {opacity: pressed ? 0.65 : 1}]}><Text style={s.buttonText}>{children}</Text></Pressable>;
}
export const s = StyleSheet.create({
  page: {padding: 22, paddingTop: 14, paddingBottom: 32, width: '100%', maxWidth: 560, alignSelf: 'center', gap: 16},
  masthead: {flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:8},
  brand: {fontFamily:serif,fontSize:25,fontWeight:'700',letterSpacing:3,color:ink},
  label: {fontFamily:serif,fontSize:10,letterSpacing:1.5,color:muted},
  title: {fontFamily:serif,fontSize:34,lineHeight:36,fontWeight:'700',color:ink},
  subtitle: {fontFamily:serif,fontSize:16,lineHeight:22,fontStyle:'italic',color:muted},
  body: {fontFamily:serif,fontSize:15,lineHeight:21,color:muted},
  small: {fontFamily:serif,fontSize:12,lineHeight:18,color:muted},
  heading: {fontFamily:serif,fontSize:19,lineHeight:23,fontWeight:'700',color:ink},
  rule: {borderTopWidth:1,borderTopColor:'#D9D5D1',paddingTop:16,gap:10},
  card: {backgroundColor:'#FAF8F6',padding:16,gap:8},
  link: {fontFamily:serif,fontSize:14,color:blue,fontWeight:'600'},
  button: {backgroundColor:blue,padding:16,alignItems:'center',minHeight:48},
  buttonText: {fontFamily:serif,color:'#FFFFFF',fontSize:15,fontWeight:'600'},
});

