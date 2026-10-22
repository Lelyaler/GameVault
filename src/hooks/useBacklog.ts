import { useState, useEffect } from 'react';
import type { Game, BacklogStatus } from '../types/game';
import { calculateBacklogStats } from '../utils/gameFilters';

const BACKLOG_STORAGE_KEY = 'game_vault_backlog_v2';

export interface BacklogEntry {
  game: Game;
  status: BacklogStatus;
  userRating?: number;
  userNote?: string;
  updatedAt: string;
}

export const useBacklog = () => {
  const [entries, setEntries] = useState<BacklogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(BACKLOG_STORAGE_KEY);
      if (saved) return JSON.parse(saved);

      const oldFavs = localStorage.getItem('game_vault_favorites');
      if (oldFavs) {
        const parsed: Game[] = JSON.parse(oldFavs);
        return parsed.map((g) => ({
          game: g,
          status: 'backlog' as BacklogStatus,
          updatedAt: new Date().toISOString(),
        }));
      }
      return [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(BACKLOG_STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.error('Failed to save backlog to localStorage:', e);
    }
  }, [entries]);

  const updateStatus = (game: Game, status: BacklogStatus | null) => {
    setEntries((prev) => {
      if (status === null) {
        return prev.filter((e) => e.game.id !== game.id);
      }
      const existing = prev.find((e) => e.game.id === game.id);
      if (existing) {
        return prev.map((e) =>
          e.game.id === game.id
            ? { ...e, status, updatedAt: new Date().toISOString() }
            : e
        );
      }
      return [
        ...prev,
        {
          game,
          status,
          updatedAt: new Date().toISOString(),
        },
      ];
    });
  };

  const updateRating = (gameId: number, rating: number) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.game.id === gameId
          ? { ...e, userRating: rating, updatedAt: new Date().toISOString() }
          : e
      )
    );
  };

  const updateNote = (gameId: number, note: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.game.id === gameId
          ? { ...e, userNote: note, updatedAt: new Date().toISOString() }
          : e
      )
    );
  };

  const getStatus = (gameId: number): BacklogStatus | null => {
    const found = entries.find((e) => e.game.id === gameId);
    return found ? found.status : null;
  };

  const getRating = (gameId: number): number => {
    const found = entries.find((e) => e.game.id === gameId);
    return found?.userRating || 0;
  };

  const getNote = (gameId: number): string => {
    const found = entries.find((e) => e.game.id === gameId);
    return found?.userNote || '';
  };

  const clearAll = () => {
    setEntries([]);
  };

  const importEntries = (imported: unknown): number => {
    if (!Array.isArray(imported)) return 0;
    const valid = imported.filter(
      (item): item is BacklogEntry =>
        item &&
        typeof item === 'object' &&
        'game' in item &&
        'status' in item &&
        typeof (item as BacklogEntry).game?.id === 'number'
    );
    if (valid.length > 0) {
      setEntries(valid);
      return valid.length;
    }
    return 0;
  };

  const stats = calculateBacklogStats(entries);

  return {
    entries,
    updateStatus,
    updateRating,
    updateNote,
    getStatus,
    getRating,
    getNote,
    clearAll,
    importEntries,
    stats,
  };
};

export const useFavorites = useBacklog;
