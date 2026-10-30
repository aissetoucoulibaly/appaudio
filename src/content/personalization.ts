import type { Story } from './stories';

export type Settings = {
  hero: string; friends: string[]; selectedFriends: string[];
  voice: string; music: boolean; musicVolume: number; monthlyBudget: 5 | 10;
};
export const defaultSettings: Settings = {
  hero: '', friends: [], selectedFriends: [], voice: '', music: true, musicVolume: 0.12, monthlyBudget: 5,
};

// Names only, never arbitrary instructions, addresses or biographies.
export function cleanName(value: unknown): string {
  if (typeof value !== 'string') return '';
  const name = value.normalize('NFC').trim().replace(/\s+/g, ' ');
  return name.length <= 24 && /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(name) ? name : '';
}
export function normalizeSettings(value: unknown): Settings {
  const v = (value && typeof value === 'object' ? value : {}) as Partial<Settings>;
  const friends = Array.isArray(v.friends) ? [...new Set(v.friends.map(cleanName).filter(Boolean))].slice(0, 3) : [];
  return {
    hero: cleanName(v.hero), friends,
    selectedFriends: Array.isArray(v.selectedFriends) ? friends.filter(n => v.selectedFriends!.includes(n)) : [],
    voice: typeof v.voice === 'string' ? v.voice.slice(0, 200) : '',
    music: typeof v.music === 'boolean' ? v.music : true,
    musicVolume: typeof v.musicVolume === 'number' && Number.isFinite(v.musicVolume) ? Math.max(0, Math.min(0.25, v.musicVolume)) : 0.12,
    monthlyBudget: v.monthlyBudget === 10 ? 10 : 5,
  };
}
export function personalize(story: Story, settings: Settings): Story {
  if (!settings.hero) return story;
  const hero = settings.hero;
  const paragraphs = story.paragraphs.map(p => p.replace(/Mina/g, () => hero)
    .replace('une enfant du village', 'un enfant du village')
    .replace('murmura-t-elle', `murmura ${hero}`)
    .replace(`${hero}, elle, avait`, `${hero} avait`)
    .replace('resta avec elle', `resta avec ${hero}`)
    .replace('chercher toute seule : elle resta', `chercher sans adulte : ${hero} resta`)
    .replace('demanda-t-elle', `demanda ${hero}`)
    .replace('Elle dessina', `${hero} dessina`).replace('elle marcha', `${hero} marcha`));
  if (settings.selectedFriends.length) {
    const friends = settings.selectedFriends.join(' et ');
    paragraphs.unshift(`Aujourd’hui, ${hero} retrouve ${friends} au village des Tilleuls. Les parents accompagnent la petite équipe. Chacun a sa place dans cette aventure.`);
    paragraphs.splice(paragraphs.length - 1, 0, `${hero} et ${friends} se retrouvent avec leurs parents. Ensemble, les amis inventent un dessin de leur aventure. Chacun ajoute une couleur. Puis vient le moment de se dire : à bientôt pour une nouvelle histoire aux Tilleuls !`);
  }
  return { ...story, paragraphs };
}
