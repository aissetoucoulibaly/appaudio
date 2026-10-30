import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { approvalVersion, stories } from '../content/stories';
import { defaultSettings, normalizeSettings, type Settings } from '../content/personalization';

const KEY = 'petites-aventures:library:v1';
type Saved = { approvals: Record<string, number>; favorites: string[]; settings: Settings };
type Library = Saved & {
  loaded: boolean; storageError: boolean; parentUntil: number;
  unlock: () => void; lock: () => void;
  approve: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => void;
  reset: () => Promise<boolean>;
  saveSettings: (settings: Settings) => Promise<boolean>;
  chooseFriends: (names: string[]) => void;
};
const Context = createContext<Library | null>(null);
const empty: Saved = { approvals: {}, favorites: [], settings: defaultSettings };

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Saved>(empty);
  const ref = useRef(saved);
  const writes = useRef(Promise.resolve());
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [parentUntil, setParentUntil] = useState(0);
  useEffect(() => {
    if (!parentUntil) return;
    const timer = setTimeout(() => setParentUntil(0), Math.max(0, parentUntil - Date.now()));
    return () => clearTimeout(timer);
  }, [parentUntil]);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY).then(raw => {
      if (!active || !raw) return;
      const data: unknown = JSON.parse(raw);
      if (!data || typeof data !== 'object') throw new Error('Invalid library');
      const value = data as Partial<Saved>;
      const next: Saved = {
        settings: normalizeSettings(value.settings),
        approvals: Object.fromEntries(stories.filter(s => value.approvals?.[s.id] === approvalVersion).map(s => [s.id, approvalVersion])),
        favorites: Array.isArray(value.favorites) ? value.favorites.filter(id => stories.some(s => s.id === id)) : [],
      };
      ref.current = next; setSaved(next);
    }).catch(() => { if (active) setStorageError(true); })
      .finally(() => { if (active) setLoaded(true); });
    const sub = AppState.addEventListener('change', state => { if (state !== 'active') setParentUntil(0); });
    return () => { active = false; sub.remove(); };
  }, []);

  // Serialize writes so a slow favorite save cannot overwrite a later reset.
  async function persist(next: Saved): Promise<boolean> {
    ref.current = next; setSaved(next);
    let success = true;
    const write = writes.current.then(async () => {
      try { await AsyncStorage.setItem(KEY, JSON.stringify(next)); setStorageError(false); }
      catch { setStorageError(true); success = false; }
    });
    writes.current = write;
    await write;
    return success;
  }
  return <Context.Provider value={{ ...saved, loaded, storageError, parentUntil,
    unlock: () => setParentUntil(Date.now() + 5 * 60_000), lock: () => setParentUntil(0),
    approve: async id => {
      if (Date.now() >= parentUntil || !stories.some(s => s.id === id)) return false;
      return persist({ ...ref.current, approvals: { ...ref.current.approvals, [id]: approvalVersion } });
    },
    toggleFavorite: id => {
      if (!stories.some(s => s.id === id)) return;
      void persist({ ...ref.current, favorites: ref.current.favorites.includes(id) ? ref.current.favorites.filter(x => x !== id) : [...ref.current.favorites, id] });
    },
    saveSettings: async settings => {
      if (Date.now() >= parentUntil) return false;
      return persist({ ...ref.current, settings: normalizeSettings(settings), approvals: {} });
    },
    chooseFriends: names => {
      const settings = { ...ref.current.settings, selectedFriends: names.filter(n => ref.current.settings.friends.includes(n)) };
      void persist({ ...ref.current, settings, approvals: {} });
    },
    reset: () => persist(empty),
  }}>{children}</Context.Provider>;
}
export function useLibrary() {
  const context = useContext(Context);
  if (!context) throw new Error('LibraryProvider missing');
  return context;
}
