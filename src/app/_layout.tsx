import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LibraryProvider } from '../state/Library';

export default function Layout() {
  return <LibraryProvider><StatusBar style="dark" /><Stack screenOptions={{ headerShown: false }} /></LibraryProvider>;
}
