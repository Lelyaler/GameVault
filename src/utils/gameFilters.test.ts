import { describe, it, expect } from 'vitest';
import { filterGames, calculateBacklogStats } from './gameFilters';
import type { Game } from '../types/game';
import type { BacklogEntry } from '../hooks/useBacklog';

const TEST_GAMES: Game[] = [
  {
    id: 1,
    slug: 'witcher-3',
    name: 'The Witcher 3',
    released: '2015-05-18',
    background_image: '',
    rating: 4.8,
    rating_top: 5,
    metacritic: 92,
    playtime: 50,
    genres: [{ id: 5, name: 'RPG', slug: 'rpg' }],
    parent_platforms: [{ platform: { id: 1, name: 'PC', slug: 'pc' } }],
  },
  {
    id: 2,
    slug: 'portal-2',
    name: 'Portal 2',
    released: '2011-04-18',
    background_image: '',
    rating: 4.7,
    rating_top: 5,
    metacritic: 95,
    playtime: 10,
    genres: [{ id: 7, name: 'Puzzle', slug: 'puzzle' }],
    parent_platforms: [{ platform: { id: 1, name: 'PC', slug: 'pc' } }],
  },
  {
    id: 3,
    slug: 'indie-gem',
    name: 'Indie Gem',
    released: '2023-01-01',
    background_image: '',
    rating: 3.9,
    rating_top: 5,
    metacritic: 78,
    playtime: 5,
    genres: [{ id: 51, name: 'Indie', slug: 'indie' }],
    parent_platforms: [{ platform: { id: 1, name: 'PC', slug: 'pc' } }],
  },
];

describe('filterGames utility', () => {
  it('filters games by search query case-insensitively', () => {
    const result = filterGames(TEST_GAMES, { searchText: 'witcher' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('The Witcher 3');
  });

  it('filters games by genre id', () => {
    const result = filterGames(TEST_GAMES, { genreId: 7 });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('portal-2');
  });

  it('filters masterpieces with metacritic 90+', () => {
    const result = filterGames(TEST_GAMES, { filterChip: 'masterpiece' });
    expect(result).toHaveLength(2);
    expect(result.map((g) => g.slug)).toEqual(['witcher-3', 'portal-2']);
  });

  it('filters short games under 25 hours', () => {
    const result = filterGames(TEST_GAMES, { filterChip: 'short' });
    expect(result).toHaveLength(2);
    expect(result.map((g) => g.slug)).toEqual(['portal-2', 'indie-gem']);
  });

  it('sorts games by Metacritic descending', () => {
    const result = filterGames(TEST_GAMES, { sortOrder: '-metacritic' });
    expect(result[0].metacritic).toBe(95);
    expect(result[1].metacritic).toBe(92);
    expect(result[2].metacritic).toBe(78);
  });

  it('sorts games by playtime descending and ascending', () => {
    const desc = filterGames(TEST_GAMES, { sortOrder: '-playtime' });
    expect(desc[0].playtime).toBe(50);
    expect(desc[desc.length - 1].playtime).toBe(5);

    const asc = filterGames(TEST_GAMES, { sortOrder: 'playtime' });
    expect(asc[0].playtime).toBe(5);
    expect(asc[asc.length - 1].playtime).toBe(50);
  });

  it('filters games by mood', () => {
    const result = filterGames(TEST_GAMES, { mood: 'puzzle' });
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('portal-2');
  });
});

describe('calculateBacklogStats utility', () => {
  it('correctly calculates statistics from backlog entries', () => {
    const mockEntries: BacklogEntry[] = [
      { game: TEST_GAMES[0], status: 'playing', userNote: 'Main campaign finished, playing DLC', updatedAt: '2026-01-01' },
      { game: TEST_GAMES[1], status: 'completed', userRating: 5, userNote: '100% achievements', updatedAt: '2026-01-02' },
      { game: TEST_GAMES[2], status: 'backlog', updatedAt: '2026-01-03' },
    ];

    const stats = calculateBacklogStats(mockEntries);

    expect(stats.total).toBe(3);
    expect(stats.playing).toBe(1);
    expect(stats.completed).toBe(1);
    expect(stats.backlog).toBe(1);
    expect(stats.totalPlaytime).toBe(65);
  });

  it('returns zeros for empty backlog', () => {
    const stats = calculateBacklogStats([]);
    expect(stats.total).toBe(0);
    expect(stats.playing).toBe(0);
    expect(stats.completed).toBe(0);
    expect(stats.totalPlaytime).toBe(0);
  });
});
