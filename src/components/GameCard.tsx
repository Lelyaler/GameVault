import React, { useState, useEffect } from 'react';
import type { Game, BacklogStatus } from '../types/game';
import { PlatformIcons } from './PlatformIcons';
import { CriticScore } from './CriticScore';
import { Bookmark, Check, Clock, Play } from 'lucide-react';

interface Props {
  game: Game;
  userStatus?: BacklogStatus | null;
  onUpdateStatus?: (game: Game, status: BacklogStatus | null) => void;
  onSelectGame?: (game: Game) => void;
  priority?: boolean;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80';

export const GameCard: React.FC<Props> = ({
  game,
  userStatus = null,
  onUpdateStatus,
  onSelectGame,
  priority = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const images = React.useMemo(() => {
    const list: string[] = [game.background_image || game.short_screenshots?.[0]?.image || game.backdrop_image || FALLBACK_IMAGE];
    if (game.background_image && !list.includes(game.background_image)) {
      list.push(game.background_image);
    }
    if (game.short_screenshots && game.short_screenshots.length > 0) {
      game.short_screenshots.forEach((s) => {
        if (s.image && !list.includes(s.image)) {
          list.push(s.image);
        }
      });
    }
    return list.slice(0, 4);
  }, [game]);

  useEffect(() => {
    if (!isHovered || images.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    }, 1400);

    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  const releaseYear = game.released ? new Date(game.released).getFullYear() : null;
  const primaryGenre = game.genres?.[0]?.name;

  return (
    <article
      tabIndex={0}
      onClick={() => onSelectGame?.(game)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectGame?.(game);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowStatusMenu(false);
        setActiveImageIndex(0);
      }}
      className={`group flex flex-col cursor-pointer transition-all duration-300 relative focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 rounded-xl outline-none ${
        !priority ? 'game-card-deferred' : ''
      }`}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-900 shadow-sm">
        <img
          src={images[activeImageIndex] || FALLBACK_IMAGE}
          alt={game.name}
          width={300}
          height={172}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="w-full h-full object-cover object-center transition-all duration-500 ease-out group-hover:scale-103"
        />

        {isHovered && images.length > 1 && (
          <div className="absolute bottom-2 inset-x-0 flex justify-center items-center gap-1.5 z-10">
            {images.map((_, idx) => (
              <span
                key={idx}
                onMouseEnter={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
                className={`h-1 rounded-full transition-all duration-300 ${
                  activeImageIndex === idx
                    ? 'w-5 bg-white'
                    : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}

        <div className="absolute top-2.5 right-2.5 z-20">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowStatusMenu((prev) => !prev);
            }}
            className={`p-1.5 rounded-lg transition-all duration-200 shadow-md ${
              userStatus
                ? 'bg-white text-zinc-950 opacity-100'
                : 'bg-zinc-900/90 text-white/80 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-white hover:text-zinc-950'
            }`}
            title="Статус в библиотеке"
          >
            {userStatus === 'playing' ? (
              <Play className="w-3.5 h-3.5 fill-current" />
            ) : userStatus === 'completed' ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Bookmark className={`w-3.5 h-3.5 ${userStatus ? 'fill-current' : ''}`} />
            )}
          </button>

          {showStatusMenu && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-9 w-40 bg-zinc-900 rounded-xl shadow-[0_12px_32px_rgba(0,0,0,0.85)] p-1 z-30 space-y-0.5 animate-fadeIn text-xs"
            >
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus?.(game, userStatus === 'playing' ? null : 'playing');
                  setShowStatusMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  userStatus === 'playing' ? 'bg-emerald-500/20 text-emerald-300 font-medium' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Играю</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateStatus?.(game, userStatus === 'backlog' ? null : 'backlog');
                  setShowStatusMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  userStatus === 'backlog' ? 'bg-amber-500/20 text-amber-300 font-medium' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>В планы</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onUpdateStatus?.(game, userStatus === 'completed' ? null : 'completed');
                  setShowStatusMenu(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  userStatus === 'completed' ? 'bg-blue-500/20 text-blue-300 font-medium' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Пройдено</span>
              </button>

              {userStatus && (
                <div className="pt-1 mt-1 bg-white/[0.04] rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStatus?.(game, null);
                      setShowStatusMenu(false);
                    }}
                    className="w-full px-2.5 py-1 text-left text-rose-400 hover:bg-white/5 rounded-lg"
                  >
                    Удалить статус
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 sm:pt-3 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <PlatformIcons platforms={game.parent_platforms} />
          <CriticScore score={game.metacritic} />
        </div>

        <h3 className="font-semibold text-sm sm:text-[15px] text-zinc-100 leading-snug group-hover:text-white transition-colors line-clamp-1">
          {game.name}
        </h3>

        <div className="flex items-center justify-between text-[11px] sm:text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 sm:gap-2 truncate">
            {releaseYear && <span>{releaseYear}</span>}
            {releaseYear && primaryGenre && <span>•</span>}
            {primaryGenre && <span className="truncate">{primaryGenre}</span>}
          </div>

          {userStatus && (
            <span className={`shrink-0 text-[10px] font-medium px-1.5 py-0.2 rounded ${
              userStatus === 'playing' ? 'text-emerald-400 bg-emerald-950/40' :
              userStatus === 'completed' ? 'text-blue-400 bg-blue-950/40' :
              'text-amber-400 bg-amber-950/40'
            }`}>
              {userStatus === 'playing' ? 'Играю' : userStatus === 'completed' ? 'Пройдено' : 'В планах'}
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
