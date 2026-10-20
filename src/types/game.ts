export interface Platform {
  id: number;
  name: string;
  slug: string;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: string;
}

export interface Screenshot {
  id: number;
  image: string;
}

export type BacklogStatus = 'playing' | 'backlog' | 'completed';

export interface UserGameData {
  gameId: number;
  status: BacklogStatus;
  rating?: number;
  updatedAt: string;
}

export interface Game {
  id: number;
  slug: string;
  name: string;
  released: string;
  background_image: string;
  backdrop_image?: string;
  rating: number;
  rating_top: number;
  metacritic: number | null;
  playtime: number;
  genres: Genre[];
  parent_platforms: { platform: Platform }[];
  short_screenshots?: Screenshot[];
  description_raw?: string;
  trailer_url?: string;
  pc_requirements?: {
    minimum?: string;
    recommended?: string;
  } | null;
}


export interface GameQuery {
  genreId?: number | null;
  platformId?: number | null;
  sortOrder?: string;
  searchText?: string;
  filterChip?: string | null;
  mood?: string | null;
  page?: number;
}
