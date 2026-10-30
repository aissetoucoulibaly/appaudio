import { View } from 'react-native';
import type { Universe } from '../content/stories';

/** Small original geometric cover; no remote images or font downloads. */
export function StoryCover({ universe }: { universe: Universe }) {
  const fire = universe === 'fire';
  const accent = fire ? '#B7624F' : '#586B99';
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height: 148, borderRadius: 14, backgroundColor: fire ? '#F3E1D4' : '#E3E7F2', overflow: 'hidden', justifyContent: 'flex-end', alignItems: 'center' }}>
    <View style={{ position: 'absolute', top: 20, right: 35, width: 32, height: 32, borderRadius: 20, backgroundColor: '#FFF7D9' }} />
    <View style={{ position: 'absolute', width: 360, height: 90, bottom: -50, borderRadius: 180, backgroundColor: fire ? '#D8C3AA' : '#C6CDDE' }} />
    <View style={{ width: 160, height: 60, backgroundColor: accent, borderRadius: 9, marginBottom: 25 }}>
      <View style={{ position: 'absolute', width: 35, height: 26, top: 7, right: 8, borderRadius: 4, backgroundColor: '#F8EDDA' }} />
      <View style={{ position: 'absolute', top: -13, left: 12, width: 85, height: 8, borderRadius: 4, backgroundColor: fire ? '#F9F3E7' : accent }} />
      {[22, 116].map(left => <View key={left} style={{ width: 27, height: 27, borderRadius: 15, backgroundColor: '#333C52', borderWidth: 6, borderColor: '#646B79', position: 'absolute', left, bottom: -13 }} />)}
      <View style={{ position: 'absolute', top: -8, right: 27, width: 16, height: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: '#D79977' }} />
      {!fire && <View style={{ width: 24, height: 24, backgroundColor: '#EFE3B7', borderRadius: 12, margin: 17 }} />}
    </View>
  </View>;
}
