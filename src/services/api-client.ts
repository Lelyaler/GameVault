const BASE_URL = 'https://api.rawg.io/api';

export const getApiKey = (): string => {
  return (
    localStorage.getItem('rawg_api_key') ||
    import.meta.env.VITE_RAWG_API_KEY ||
    ''
  );
};

export const setApiKey = (key: string) => {
  if (key.trim()) {
    localStorage.setItem('rawg_api_key', key.trim());
  } else {
    localStorage.removeItem('rawg_api_key');
  }
};

export interface FetchResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function fetchFromApi<T>(
  endpoint: string,
  params: Record<string, string | number | undefined> = {}
): Promise<FetchResponse<T>> {
  const apiKey = getApiKey();

  const searchParams = new URLSearchParams();
  if (apiKey) {
    searchParams.append('key', apiKey);
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const url = `${BASE_URL}${endpoint}?${searchParams.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
