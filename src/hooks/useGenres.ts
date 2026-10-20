import { useState, useEffect } from 'react';
import type { Genre } from '../types/game';

import { fetchFromApi, getApiKey } from '../services/api-client';
import { MOCK_GENRES } from '../data/mockGames';

export const useGenres = () => {
  const [genres, setGenres] = useState<Genre[]>(MOCK_GENRES);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const apiKey = getApiKey();

    if (!apiKey) {
      return;
    }

    const loadGenres = async () => {
      setIsLoading(true);
      try {
        const data = await fetchFromApi<Genre>('/genres', { page_size: 15 });
        if (isMounted && data.results?.length > 0) {
          setGenres(data.results);
        }
      } catch (err) {
        console.warn('Using fallback genres due to API error:', err);
        if (isMounted) setGenres(MOCK_GENRES);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadGenres();

    return () => {
      isMounted = false;
    };
  }, []);

  return { genres, isLoading };
};
