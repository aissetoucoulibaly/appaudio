import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = { bg: '#FAF8F4', ink: '#292B43', muted: '#666779', green: '#444B79', sand: '#EEEAF2', line: '#E6E1DE', white: '#FFFFFF', coral: '#C37661' };
const serif = Platform.OS === 'ios' ? 'Georgia' : Platform.OS === 'web' ? 'Georgia, serif' : 'serif';
export function Page({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return <SafeAreaView style={styles.safe}><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.page}>{children}</ScrollView>
    {!pathname.startsWith('/story/') && <View style={styles.nav}>
      {([['/', 'Ce soir'], ['/create', 'Imaginer'], ['/parent', 'Parents']] as const).map(([path, label]) =>
        <Pressable key={path} accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ selected: pathname === path }} onPress={() => router.navigate(path)} style={styles.navItem}>
          <Text style={{ fontSize: 15, fontWeight: pathname === path ? '700' : '400', color: pathname === path ? colors.green : colors.muted }}>{label}</Text>
          <View style={{ height: 3, width: 16, borderRadius: 2, backgroundColor: pathname === path ? colors.coral : 'transparent' }} />
        </Pressable>)}
    </View>}
  </SafeAreaView>;
}
export function Button({ title, onPress, secondary = false, disabled = false }: {
  title: string; onPress: () => void; secondary?: boolean; disabled?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, secondary && styles.secondary, (pressed || disabled) && { opacity: 0.55 }]}>
    <Text style={[styles.buttonText, secondary && { color: colors.ink }]}>{title}</Text>
  </Pressable>;
}
export function Card({ children }: { children: ReactNode }) { return <View style={styles.card}>{children}</View>; }
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  page: { padding: 24, gap: 20, paddingBottom: 36, maxWidth: 700, width: '100%', alignSelf: 'center' },
  eyebrow: { color: colors.coral, fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  title: { fontSize: 38, fontFamily: serif, color: colors.ink, lineHeight: 46 },
  heading: { fontSize: 23, fontFamily: serif, color: colors.ink, lineHeight: 31 },
  text: { fontSize: 17, lineHeight: 26, color: colors.ink },
  muted: { fontSize: 15, lineHeight: 23, color: colors.muted },
  card: { padding: 20, borderRadius: 20, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, gap: 14 },
  button: { minHeight: 48, borderRadius: 14, backgroundColor: colors.green, paddingHorizontal: 17, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.sand },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.white, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  paragraph: { fontSize: 19, lineHeight: 32, fontFamily: serif, color: colors.ink },
  nav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg },
  navItem: { minHeight: 48, flex: 1, alignItems: 'center', justifyContent: 'center', gap: 7 },
  input: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, borderRadius: 14, padding: 16, fontSize: 17, color: colors.ink },
});
