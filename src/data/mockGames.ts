import type { Game, Genre } from '../types/game';
import gamesData from './games.json';

const BASE = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL)
  ? (import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`)
  : '/';

export const MOCK_GENRES: Genre[] = [
  {
    id: 4,
    name: 'Action',
    slug: 'action',
    image_background: `${BASE}images/capsules/elden-ring.webp`,
  },
  {
    id: 5,
    name: 'RPG',
    slug: 'role-playing-games-rpg',
    image_background: `${BASE}images/capsules/the-witcher-3-wild-hunt.webp`,
  },
  {
    id: 3,
    name: 'Adventure',
    slug: 'adventure',
    image_background: `${BASE}images/capsules/god-of-war.webp`,
  },
  {
    id: 2,
    name: 'Shooter',
    slug: 'shooter',
    image_background: `${BASE}images/capsules/doom-eternal.webp`,
  },
  {
    id: 7,
    name: 'Puzzle',
    slug: 'puzzle',
    image_background: `${BASE}images/capsules/portal-2.webp`,
  },
  {
    id: 1,
    name: 'Horror',
    slug: 'horror',
    image_background: `${BASE}images/capsules/resident-evil-4.webp`,
  },
  {
    id: 10,
    name: 'Strategy',
    slug: 'strategy',
    image_background: `${BASE}images/capsules/baldurs-gate-3.webp`,
  },
  {
    id: 51,
    name: 'Indie',
    slug: 'indie',
    image_background: `${BASE}images/capsules/hollow-knight.webp`,
  },
];

const resolveAssetPath = (path?: string): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${BASE}${path.replace(/^\/+/, '')}`;
};

export const MOCK_GAMES: Game[] = (gamesData as Game[]).map((game) => ({
  ...game,
  background_image: resolveAssetPath(game.background_image),
  backdrop_image: game.backdrop_image ? resolveAssetPath(game.backdrop_image) : undefined,
  short_screenshots: game.short_screenshots?.map((screenshot) => ({
    ...screenshot,
    image: resolveAssetPath(screenshot.image),
  })),
}));
