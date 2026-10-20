import { useState, useEffect } from 'react';
import type { Game, GameQuery } from '../types/game';

import { fetchFromApi, getApiKey } from '../services/api-client';
import { MOCK_GAMES } from '../data/mockGames';

interface UseGamesResult {
  games: Game[];
  error: string | null;
  isLoading: boolean;
  isUsingMock: boolean;
}

export const useGames = (gameQuery: GameQuery, reloadTrigger = 0): UseGamesResult => {
  const [games, setGames] = useState<Game[]>(() => (!getApiKey() ? MOCK_GAMES : []));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => !!getApiKey());
  const [isUsingMock, setIsUsingMock] = useState<boolean>(() => !getApiKey());

  useEffect(() => {
    let isMounted = true;
    const apiKey = getApiKey();

    const loadGames = async () => {
      setError(null);

      if (!apiKey) {
        setIsUsingMock(true);
        if (isMounted) {
          setGames(MOCK_GAMES);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);

      try {
        setIsUsingMock(false);
        const data = await fetchFromApi<Game>('/games', {
          genres: gameQuery.genreId || undefined,
          parent_platforms: gameQuery.platformId || undefined,
          ordering: gameQuery.sortOrder || undefined,
          search: gameQuery.searchText || undefined,
          page_size: 24,
        });

        if (isMounted) {
          setGames(data.results || []);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        console.error('Failed to fetch live games:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Не удалось загрузить игры из RAWG API'
        );
        setGames(MOCK_GAMES);
        setIsUsingMock(true);
        setIsLoading(false);
      }
    };

    loadGames();

    return () => {
      isMounted = false;
    };
  }, [gameQuery.genreId, gameQuery.platformId, gameQuery.sortOrder, gameQuery.searchText, reloadTrigger]);

  return { games, error, isLoading, isUsingMock };
};
