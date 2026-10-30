import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { approvalVersion, stories, type Story } from '../content/stories';
import { defaultSettings, normalizeSettings, type Settings } from '../content/personalization';

import { defaultBrief, normalizeBrief, type Brief } from '../content/brief';

function requestKey() { return `evening-${Date.now()}-${Math.random().toString(36).slice(2)}`; }
function validStory(v: unknown): v is Story {
  if (!v || typeof v !== 'object') return false;
  const s = v as Story;
  return typeof s.id === 'string' && s.id.startsWith('created-') && typeof s.title === 'string' && s.title.length <= 120 && typeof s.subtitle === 'string' && s.subtitle.length <= 300 && (s.universe === 'fire' || s.universe === 'police') && Array.isArray(s.paragraphs) && s.paragraphs.length >= 3 && s.paragraphs.length <= 20 && s.paragraphs.every(p => typeof p === 'string' && p.length <= 4000);
}

const KEY = 'petites-aventures:library:v1';
type Saved = { approvals: Record<string, number>; favorites: string[]; settings: Settings; brief: Brief; generated: Story[]; creationKey: string };
type Library = Saved & {
  allStories: Story[];
  connection: { url: string; token: string; provider: 'anthropic' | 'openai' } | null;
  connect: (url: string, token: string, provider: 'anthropic' | 'openai') => boolean;
  saveBrief: (brief: Brief) => Promise<string | null>;
  addStory: (story: unknown) => Promise<boolean>;
  deleteStory: (id: string) => void;
  loaded: boolean; storageError: boolean; parentUntil: number;
  unlock: () => void; lock: () => void;
  approve: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string) => void;
  reset: () => Promise<boolean>;
  saveSettings: (settings: Settings) => Promise<boolean>;
  chooseFriends: (names: string[]) => void;
};
const Context = createContext<Library | null>(null);
const empty: Saved = { approvals: {}, favorites: [], settings: defaultSettings, brief: defaultBrief, generated: [], creationKey: '' };

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [connection, setConnection] = useState<{ url: string; token: string; provider: 'anthropic' | 'openai' } | null>(null);
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
      const generated = Array.isArray(value.generated) ? value.generated.filter(validStory).slice(0, 100).map(s => ({ ...s, fixedCast: true })) : [];
      const known = [...stories, ...generated];
      const next: Saved = {
        brief: normalizeBrief(value.brief), generated,
        creationKey: typeof value.creationKey === 'string' && /^[a-zA-Z0-9-]{1,100}$/.test(value.creationKey) ? value.creationKey : requestKey(),
        settings: normalizeSettings(value.settings),
        approvals: Object.fromEntries(known.filter(s => value.approvals?.[s.id] === approvalVersion).map(s => [s.id, approvalVersion])),
        favorites: Array.isArray(value.favorites) ? value.favorites.filter(id => known.some(s => s.id === id)) : [],
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
  return <Context.Provider value={{ ...saved, allStories: [...stories, ...saved.generated], connection, loaded, storageError, parentUntil,
    unlock: () => setParentUntil(Date.now() + 5 * 60_000), lock: () => setParentUntil(0),
    approve: async id => {
      if (Date.now() >= parentUntil || ![...stories, ...ref.current.generated].some(s => s.id === id)) return false;
      return persist({ ...ref.current, approvals: { ...ref.current.approvals, [id]: approvalVersion } });
    },
    toggleFavorite: id => {
      if (![...stories, ...ref.current.generated].some(s => s.id === id)) return;
      void persist({ ...ref.current, favorites: ref.current.favorites.includes(id) ? ref.current.favorites.filter(x => x !== id) : [...ref.current.favorites, id] });
    },
    saveSettings: async settings => {
      if (Date.now() >= parentUntil) return false;
      return persist({ ...ref.current, settings: normalizeSettings(settings), approvals: {}, creationKey: requestKey() });
    },
    chooseFriends: names => {
      const settings = { ...ref.current.settings, selectedFriends: names.filter(n => ref.current.settings.friends.includes(n)) };
      void persist({ ...ref.current, settings, approvals: {} });
    },
    connect: (url, token, provider) => {
      if (Date.now() >= parentUntil || token.length < 32) return false;
      try {
        const parsed = new URL(url);
        const local = /^(localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+)$/.test(parsed.hostname);
        if (parsed.username || parsed.password || parsed.search || parsed.hash || (parsed.protocol !== 'https:' && !(local && parsed.protocol === 'http:'))) return false;
        setConnection({ url: parsed.origin, token, provider }); return true;
      } catch { return false; }
    },
    saveBrief: async brief => {
      if (Date.now() >= parentUntil) return null;
      const next = normalizeBrief(brief);
      const key = JSON.stringify(next) === JSON.stringify(ref.current.brief) && ref.current.creationKey ? ref.current.creationKey : requestKey();
      return await persist({ ...ref.current, brief: next, creationKey: key }) ? key : null;
    },
    addStory: async story => {
      if (!validStory(story) || ref.current.generated.length >= 100) return false;
      if (ref.current.generated.some(s => s.id === story.id)) return true;
      return persist({ ...ref.current, generated: [{ ...story, fixedCast: true }, ...ref.current.generated], creationKey: requestKey() });
    },
    deleteStory: id => {
      if (Date.now() >= parentUntil) return;
      const approvals = { ...ref.current.approvals }; delete approvals[id];
      void persist({ ...ref.current, generated: ref.current.generated.filter(s => s.id !== id), favorites: ref.current.favorites.filter(f => f !== id), approvals });
    },
    reset: async () => { setConnection(null); return persist(empty); },
  }}>{children}</Context.Provider>;
}
export function useLibrary() {
  const context = useContext(Context);
  if (!context) throw new Error('LibraryProvider missing');
  return context;
}
