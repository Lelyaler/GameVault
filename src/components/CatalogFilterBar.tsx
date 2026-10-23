import React from 'react';
import type { GameQuery, Genre } from '../types/game';
import { MOODS } from '../utils/moodFilters';
import { sounds } from '../utils/soundEffects';
import { SortDropdown } from './SortDropdown';

interface Props {
  gameQuery: GameQuery;
  onUpdateQuery: (updater: (prev: GameQuery) => GameQuery) => void;
  genres: Genre[];
  totalGamesCount: number;
  viewMode: 'console' | 'grid';
  onViewModeChange: (mode: 'console' | 'grid') => void;
}

export const CatalogFilterBar: React.FC<Props> = ({
  gameQuery,
  onUpdateQuery,
  genres,
  totalGamesCount,
  viewMode,
  onViewModeChange,
}) => {
  const activeChip = gameQuery.filterChip || 'all';
  const activeGenreId = gameQuery.genreId || null;
  const activeMood = gameQuery.mood || null;
  const activeSort = gameQuery.sortOrder || '';

  const hasActiveFilters = Boolean(
    activeChip !== 'all' || activeGenreId !== null || activeMood || activeSort
  );

  const handleSelectChip = (chipId: string) => {
    sounds.playNav();
    onUpdateQuery((prev) => ({ ...prev, filterChip: chipId }));
  };

  const handleSelectGenre = (genreId: number | null) => {
    sounds.playNav();
    onUpdateQuery((prev) => ({
      ...prev,
      genreId: prev.genreId === genreId ? null : genreId,
    }));
  };

  const handleSelectMood = (moodId: string | null) => {
    sounds.playNav();
    onUpdateQuery((prev) => ({
      ...prev,
      mood: prev.mood === moodId ? null : moodId,
    }));
  };

  const handleResetFilters = () => {
    sounds.playBack();
    onUpdateQuery((prev) => ({
      ...prev,
      filterChip: 'all',
      genreId: null,
      mood: null,
      sortOrder: undefined,
    }));
  };

  return (
    <div className="relative space-y-2.5 py-1">
      {/* Top row: Collection tabs & Tools */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Main collection categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => handleSelectChip('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors outline-none ${
              activeChip === 'all'
                ? 'bg-white text-zinc-950 font-bold shadow-sm'
                : 'bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            Все игры
          </button>

          <button
            type="button"
            onClick={() => handleSelectChip('masterpiece')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors outline-none ${
              activeChip === 'masterpiece'
                ? 'bg-white text-zinc-950 font-bold shadow-sm'
                : 'bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            Шедевры (90+)
          </button>

          <button
            type="button"
            onClick={() => handleSelectChip('short')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors outline-none ${
              activeChip === 'short'
                ? 'bg-white text-zinc-950 font-bold shadow-sm'
                : 'bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            Короткие (до 25 ч)
          </button>

          <button
            type="button"
            onClick={() => handleSelectChip('top_rated')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors outline-none ${
              activeChip === 'top_rated'
                ? 'bg-white text-zinc-950 font-bold shadow-sm'
                : 'bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white'
            }`}
          >
            Высокий рейтинг
          </button>
        </div>

        {/* Right tools: Reset, Counter, Sort, View mode */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white bg-white/[0.05] hover:bg-white/10 transition-colors"
              title="Сбросить выбранные фильтры"
            >
              Сбросить
            </button>
          )}

          <span className="hidden xl:inline-block text-[11px] font-semibold text-zinc-500 px-2 py-1">
            {totalGamesCount} игр
          </span>

          <SortDropdown
            value={activeSort}
            onChange={(newSort) => {
              onUpdateQuery((prev) => ({
                ...prev,
                sortOrder: newSort || undefined,
              }));
            }}
          />

          <div className="hidden lg:flex items-center gap-0.5 bg-white/[0.05] p-0.5 rounded-xl shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onViewModeChange('console');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'console'
                  ? 'bg-white text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Консольная полка"
            >
              Полка
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onViewModeChange('grid');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Сетка игр"
            >
              Сетка
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar: Genres and Moods */}
      <div className="pt-1 flex flex-col md:flex-row md:items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar">
        {/* Genres */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 shrink-0 mr-1.5">
            Жанр:
          </span>

          <button
            type="button"
            onClick={() => handleSelectGenre(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors outline-none ${
              activeGenreId === null
                ? 'bg-white text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Все
          </button>

          {genres.slice(0, 6).map((genre) => {
            const isSelected = activeGenreId === genre.id;
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => handleSelectGenre(genre.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors outline-none ${
                  isSelected
                    ? 'bg-white text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {genre.name}
              </button>
            );
          })}
        </div>

        <div className="hidden md:block h-3.5 w-px bg-white/10 shrink-0" />

        {/* Moods */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 shrink-0 mr-1.5">
            Настроение:
          </span>

          <button
            type="button"
            onClick={() => handleSelectMood(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors outline-none ${
              !activeMood || activeMood === 'all'
                ? 'bg-white text-zinc-950 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            Любое
          </button>

          {MOODS.map((mood) => {
            const isSelected = activeMood === mood.id;
            return (
              <button
                key={mood.id}
                type="button"
                title={mood.description}
                onClick={() => handleSelectMood(mood.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors outline-none ${
                  isSelected
                    ? 'bg-white text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {mood.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
