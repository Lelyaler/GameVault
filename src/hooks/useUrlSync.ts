import { useEffect } from 'react';
import type { GameQuery } from '../types/game';

interface UrlSyncParams {
  showFavoritesOnly: boolean;
  gameQuery: GameQuery;
  selectedGameSlug: string | null;
  onRestoreState: (state: {
    showFavoritesOnly: boolean;
    gameQuery: GameQuery;
    gameSlug: string | null;
  }) => void;
}

export const getInitialUrlState = () => {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get('tab');
  const genre = params.get('genre');
  const search = params.get('search');
  const sort = params.get('sort');
  const filter = params.get('filter');
  const mood = params.get('mood');
  const game = params.get('game');

  return {
    showFavoritesOnly: tab === 'library',
    gameQuery: {
      genreId: genre ? Number(genre) : null,
      searchText: search || '',
      sortOrder: sort || '',
      filterChip: filter || 'all',
      mood: mood || null,
    },
    gameSlug: game || null,
  };
};

export const useUrlSync = ({
  showFavoritesOnly,
  gameQuery,
  selectedGameSlug,
  onRestoreState,
}: UrlSyncParams) => {
  useEffect(() => {
    const params = new URLSearchParams();

    if (showFavoritesOnly) {
      params.set('tab', 'library');
    }

    if (gameQuery.genreId) {
      params.set('genre', String(gameQuery.genreId));
    }

    if (gameQuery.searchText) {
      params.set('search', gameQuery.searchText);
    }

    if (gameQuery.sortOrder) {
      params.set('sort', gameQuery.sortOrder);
    }

    if (gameQuery.filterChip && gameQuery.filterChip !== 'all') {
      params.set('filter', gameQuery.filterChip);
    }

    if (gameQuery.mood) {
      params.set('mood', gameQuery.mood);
    }

    if (selectedGameSlug) {
      params.set('game', selectedGameSlug);
    }

    const queryString = params.toString();
    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(null, '', newUrl);
  }, [showFavoritesOnly, gameQuery, selectedGameSlug]);

  useEffect(() => {
    const handlePopState = () => {
      const state = getInitialUrlState();
      onRestoreState(state);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onRestoreState]);
};
