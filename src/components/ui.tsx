import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const colors = { bg: '#F8F4EC', ink: '#20372F', muted: '#59665F', green: '#285B48', sand: '#EDE5D7', line: '#D9D8CA', white: '#FFFFFF' };
export function Page({ children }: { children: ReactNode }) {
  return <SafeAreaView style={styles.safe}><ScrollView contentContainerStyle={styles.page}>{children}</ScrollView></SafeAreaView>;
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
  page: { padding: 24, gap: 18, paddingBottom: 48, maxWidth: 700, width: '100%', alignSelf: 'center' },
  eyebrow: { color: colors.green, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  title: { fontSize: 35, fontWeight: '800', color: colors.ink, lineHeight: 41 },
  heading: { fontSize: 22, fontWeight: '700', color: colors.ink },
  text: { fontSize: 17, lineHeight: 26, color: colors.ink },
  muted: { fontSize: 15, lineHeight: 23, color: colors.muted },
  card: { padding: 22, borderRadius: 24, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, gap: 14 },
  button: { minHeight: 52, borderRadius: 16, backgroundColor: colors.green, padding: 15, alignItems: 'center', justifyContent: 'center' },
  secondary: { backgroundColor: colors.sand },
  buttonText: { fontSize: 16, fontWeight: '700', color: colors.white, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  paragraph: { fontSize: 18, lineHeight: 30, color: colors.ink },
});
