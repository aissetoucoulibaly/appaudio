export type Brief = {
  universe: 'fire' | 'police'; mission: 'animal' | 'mystery' | 'thief';
  setting: 'village' | 'forest' | 'station'; mood: 'sleep' | 'adventure';
  companions: string[]; detail: string;
};
export const defaultBrief: Brief = { universe: 'fire', mission: 'animal', setting: 'village', mood: 'sleep', companions: [], detail: '' };
export const missions = { animal: 'Aider un animal', mystery: 'Résoudre un mystère', thief: 'Retrouver un voleur' } as const;
export const settings = { village: 'Au village', forest: 'Dans la forêt', station: 'À la caserne' } as const;
export function normalizeBrief(value: unknown): Brief {
  const v = (value && typeof value === 'object' ? value : {}) as Partial<Brief>;
  return {
    universe: v.universe === 'police' ? 'police' : 'fire',
    mission: v.mission === 'thief' || v.mission === 'mystery' ? v.mission : 'animal',
    setting: v.setting === 'forest' || v.setting === 'station' ? v.setting : 'village',
    mood: v.mood === 'adventure' ? 'adventure' : 'sleep',
    companions: Array.isArray(v.companions) ? v.companions.filter((n): n is string => typeof n === 'string' && n.length <= 24).slice(0, 3) : [],
    detail: typeof v.detail === 'string' ? v.detail.trim().slice(0, 400) : '',
  };
}
