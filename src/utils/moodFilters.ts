import type { Game } from '../types/game';

export interface MoodOption {
  id: string;
  name: string;
  description: string;
}

export const MOODS: MoodOption[] = [
  {
    id: 'cinema',
    name: 'Сюжетные',
    description: 'Акцент на повествовании и постановке',
  },
  {
    id: 'hardcore',
    name: 'Сложные',
    description: 'Высокий порог входа и динамичный геймплей',
  },
  {
    id: 'chill',
    name: 'Медитативные',
    description: 'Неспешный темп и расслабляющий процесс',
  },
  {
    id: 'openworld',
    name: 'Открытый мир',
    description: 'Исследование обширных локаций',
  },
  {
    id: 'puzzle',
    name: 'Головоломки',
    description: 'Логические и пространственные задачи',
  },
];

const MOOD_MAPPINGS: Record<string, string[]> = {
  cinema: [
    'the-last-of-us-part-i',
    'detroit-become-human',
    'ghost-of-tsushima',
    'alan-wake-2',
    'death-stranding',
    'mass-effect-legendary-edition',
    'resident-evil-4',
    'red-dead-redemption-2',
    'god-of-war',
    'marvels-spider-man-remastered',
    'god-of-war-ragnarok',
    'nier-automata',
    'disco-elysium',
    'dead-space',
    'marvels-spider-man-miles-morales',
    'bloodborne',
  ],
  hardcore: [
    'elden-ring',
    'sekiro-shadows-die-twice',
    'bloodborne',
    'dark-souls-iii',
    'lies-of-p',
    'hollow-knight',
    'hades',
    'doom-eternal',
    'monster-hunter-world',
    'outer-wilds',
  ],
  chill: [
    'stray',
    'outer-wilds',
    'signalis',
    'portal-2',
    'disco-elysium',
    'death-stranding',
    'fallout-4',
  ],
  openworld: [
    'the-witcher-3-wild-hunt',
    'cyberpunk-2077',
    'grand-theft-auto-v',
    'red-dead-redemption-2',
    'elden-ring',
    'ghost-of-tsushima',
    'horizon-zero-dawn',
    'fallout-4',
    'outer-wilds',
    'marvels-spider-man-remastered',
    'marvels-spider-man-miles-morales',
  ],
  puzzle: [
    'portal-2',
    'outer-wilds',
    'signalis',
    'alan-wake-2',
    'disco-elysium',
    'control',
    'hollow-knight',
    'dishonored-2',
  ],
};

export function isGameMatchingMood(game: Game, moodId: string): boolean {
  if (!moodId || moodId === 'all') return true;
  const list = MOOD_MAPPINGS[moodId];
  if (!list) return true;
  return list.includes(game.slug);
}

export const filterGamesByMood = (games: Game[], moodId: string | null): Game[] => {
  if (!moodId || moodId === 'all') return games;
  const slugs = MOOD_MAPPINGS[moodId] || [];
  if (slugs.length === 0) return games;
  const slugSet = new Set(slugs);
  return games.filter((g) => slugSet.has(g.slug));
};
