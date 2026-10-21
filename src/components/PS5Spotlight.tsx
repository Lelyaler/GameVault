import React from 'react';
import type { Game, BacklogStatus } from '../types/game';
import { PlatformIcons } from './PlatformIcons';
import { CriticScore } from './CriticScore';

interface Props {
  game: Game;
  userStatus?: BacklogStatus | null;
  onOpenDetails: (game: Game) => void;
  onUpdateStatus: (game: Game, status: BacklogStatus | null) => void;
  onOpenCompare?: (game: Game) => void;
}

export const PS5Spotlight: React.FC<Props> = ({
  game,
  userStatus,
  onOpenDetails,
  onUpdateStatus,
  onOpenCompare,
}) => {
  const releaseYear = game.released ? new Date(game.released).getFullYear() : null;

  return (
    <div className="pt-4 sm:pt-14 pb-4 sm:pb-10 max-w-4xl animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        {game.background_image && (
          <div
            onClick={() => onOpenDetails(game)}
            className="hidden md:block shrink-0 w-28 lg:w-32 aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.8)] border border-white/15 bg-zinc-900 cursor-pointer hover:scale-103 hover:border-white/30 transition-all active:scale-95 group/poster"
            title={`Открыть карточку игры ${game.name}`}
          >
            <img
              src={game.background_image}
              alt={game.name}
              className="w-full h-full object-cover group-hover/poster:brightness-105 transition-all"
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 mb-2.5 sm:mb-3 flex-wrap">
            <PlatformIcons platforms={game.parent_platforms} />
            <CriticScore score={game.metacritic} />

            {game.rating > 0 && (
              <span className="inline-flex items-center text-xs font-semibold text-amber-400 bg-zinc-900 px-2 py-0.5 rounded-md shadow-sm">
                ★ {game.rating.toFixed(1)}
              </span>
            )}

            {releaseYear && (
              <span className="text-xs text-zinc-400 font-medium">
                {releaseYear}
              </span>
            )}

            {game.playtime > 0 && (
              <span className="text-xs text-zinc-400 font-medium">
                ~{game.playtime} ч.
              </span>
            )}

            {game.genres && game.genres.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 ml-1">
                {game.genres.slice(0, 2).map((g) => (
                  <span
                    key={g.id}
                    className="text-[11px] font-medium text-zinc-300 bg-white/[0.07] px-2 py-0.5 rounded-md"
                  >
                    {g.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none drop-shadow-md">
            {game.name}
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-zinc-300/90 mt-2.5 sm:mt-4 leading-relaxed line-clamp-2 sm:line-clamp-3 font-normal max-w-2xl drop-shadow">
            {game.description_raw ||
              (game.genres?.length ? `${game.name} — игра в жанре ${game.genres.map((g) => g.name).join(', ')}.` : game.name)}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={() => onOpenDetails(game)}
              className="inline-flex items-center justify-center px-5 py-2.5 sm:py-3 rounded-xl bg-white text-zinc-950 font-bold text-xs sm:text-sm hover:bg-zinc-200 transition-all hover:scale-103 shadow-lg shadow-white/10 active:scale-95"
            >
              Об игре
            </button>

            <button
              type="button"
              onClick={() => onOpenCompare?.(game)}
              className="inline-flex items-center justify-center px-4 py-2.5 sm:py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              Сравнить
            </button>

            <div className="inline-flex items-center justify-between sm:justify-start gap-1 p-1 rounded-xl bg-zinc-900 shadow-lg shadow-black/50">
              <button
                type="button"
                onClick={() => onUpdateStatus(game, userStatus === 'playing' ? null : 'playing')}
                className={`flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  userStatus === 'playing'
                    ? 'bg-emerald-500 text-zinc-950 font-bold'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {userStatus === 'playing' ? 'Играю' : 'Играть'}
              </button>

              <button
                type="button"
                onClick={() => onUpdateStatus(game, userStatus === 'backlog' ? null : 'backlog')}
                className={`flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  userStatus === 'backlog'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                В планы
              </button>

              <button
                type="button"
                onClick={() => onUpdateStatus(game, userStatus === 'completed' ? null : 'completed')}
                className={`flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                  userStatus === 'completed'
                    ? 'bg-blue-500 text-zinc-950 font-bold'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
                }`}
              >
                Пройдено
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
