import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import type { Game, BacklogStatus } from '../types/game';
import { ChevronLeft, ChevronRight, Bookmark, Play, Check } from 'lucide-react';

interface Props {
  games: Game[];
  activeGameId: number;
  onHoverGame: (game: Game) => void;
  onSelectGame: (game: Game) => void;
  getStatus: (gameId: number) => BacklogStatus | null;
  onNavigateLeft?: () => void;
  onNavigateRight?: () => void;
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80';

const BASE_COPY = 2;

export const PS5GameShelf: React.FC<Props> = ({
  games,
  activeGameId,
  onHoverGame,
  onSelectGame,
  getStatus,
  onNavigateLeft,
  onNavigateRight,
}) => {
  const shelfRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const setWidthRef = useRef<number>(0);
  const [activeCopyIdx, setActiveCopyIdx] = useState<number>(BASE_COPY);
  const activeCopyRef = useRef<number>(BASE_COPY);
  const prevGameIdRef = useRef<number>(activeGameId);
  const isNormalizingRef = useRef<boolean>(false);
  const isInitialCenteredRef = useRef<boolean>(false);

  const { displayItems, isLoopable } = useMemo(() => {
    if (games.length === 0) return { displayItems: [], isLoopable: false };
    if (games.length === 1) {
      return {
        displayItems: [
          { game: games[0], copyIdx: BASE_COPY, itemIdx: 0, uid: `${BASE_COPY}-0-${games[0].id}` },
        ],
        isLoopable: false,
      };
    }

    const items: Array<{ game: Game; copyIdx: number; itemIdx: number; uid: string }> = [];
    for (let c = 0; c < 5; c++) {
      games.forEach((game, idx) => {
        items.push({
          game,
          copyIdx: c,
          itemIdx: idx,
          uid: `${c}-${idx}-${game.id}`,
        });
      });
    }

    return { displayItems: items, isLoopable: true };
  }, [games]);

  const setCardRef = useCallback((uid: string) => (el: HTMLDivElement | null) => {
    if (el) {
      cardRefs.current.set(uid, el);
    } else {
      cardRefs.current.delete(uid);
    }
  }, []);

  const updateSetWidth = useCallback(() => {
    if (!isLoopable || games.length === 0) return;
    const card1 = cardRefs.current.get(`1-0-${games[0].id}`);
    const card2 = cardRefs.current.get(`2-0-${games[0].id}`);
    if (card1 && card2) {
      const diff = card2.offsetLeft - card1.offsetLeft;
      if (diff > 0) {
        setWidthRef.current = diff;
      }
    }
  }, [isLoopable, games]);

  const scrollToCard = useCallback(
    (copyIdx: number, itemIdx: number, gameId: number, smooth = true) => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const uid = `${copyIdx}-${itemIdx}-${gameId}`;
      const card = cardRefs.current.get(uid);
      if (!card) return;

      const targetLeft = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: smooth ? 'smooth' : 'auto',
      });
    },
    []
  );

  const normalizeToCenter = useCallback(() => {
    if (isNormalizingRef.current || !isLoopable || games.length === 0) return;
    const container = scrollContainerRef.current;
    const setWidth = setWidthRef.current;
    if (!container || !setWidth || setWidth <= 0) return;

    const currentCopy = activeCopyRef.current;
    if (currentCopy === BASE_COPY) return;

    const diff = BASE_COPY - currentCopy;
    const shift = diff * setWidth;
    if (shift === 0) return;

    isNormalizingRef.current = true;
    container.scrollLeft += shift;
    activeCopyRef.current = BASE_COPY;
    setActiveCopyIdx(BASE_COPY);

    requestAnimationFrame(() => {
      isNormalizingRef.current = false;
    });
  }, [isLoopable, games]);

  useEffect(() => {
    if (games.length === 0) return;
    updateSetWidth();

    const prevId = prevGameIdRef.current;
    const curId = activeGameId;
    prevGameIdRef.current = curId;

    const prevIdx = games.findIndex((g) => g.id === prevId);
    const curIdx = games.findIndex((g) => g.id === curId);
    if (curIdx === -1) return;

    if (!isInitialCenteredRef.current) {
      isInitialCenteredRef.current = true;
      activeCopyRef.current = BASE_COPY;
      setActiveCopyIdx(BASE_COPY);
      scrollToCard(BASE_COPY, curIdx, curId, false);
      return;
    }

    if (prevId === curId) return;

    let targetCopy = activeCopyRef.current;
    if (prevIdx !== -1) {
      if (prevIdx === 0 && curIdx === games.length - 1) {
        targetCopy = activeCopyRef.current - 1;
      } else if (prevIdx === games.length - 1 && curIdx === 0) {
        targetCopy = activeCopyRef.current + 1;
      }
    }

    activeCopyRef.current = targetCopy;
    setActiveCopyIdx(targetCopy);
    scrollToCard(targetCopy, curIdx, curId, true);
  }, [activeGameId, games, scrollToCard, updateSetWidth]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isLoopable) return;

    let timer: number | null = null;
    const handleScrollIdle = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        normalizeToCenter();
      }, 250);
    };

    container.addEventListener('scroll', handleScrollIdle, { passive: true });
    container.addEventListener('scrollend', normalizeToCenter, { passive: true });

    return () => {
      if (timer) window.clearTimeout(timer);
      container.removeEventListener('scroll', handleScrollIdle);
      container.removeEventListener('scrollend', normalizeToCenter);
    };
  }, [isLoopable, normalizeToCenter]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isLoopable || games.length === 0) return;

    const ro = new ResizeObserver(() => {
      updateSetWidth();
      const curIdx = games.findIndex((g) => g.id === activeGameId);
      if (curIdx !== -1) {
        scrollToCard(activeCopyRef.current, curIdx, activeGameId, false);
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, [isLoopable, games, activeGameId, updateSetWidth, scrollToCard]);

  useEffect(() => {
    const shelf = shelfRef.current;
    const el = scrollContainerRef.current;
    if (!shelf || !el) return;

    const stopWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const stopTouch = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
      }
    };

    shelf.addEventListener('wheel', stopWheel, { passive: false });
    el.addEventListener('wheel', stopWheel, { passive: false });
    el.addEventListener('touchmove', stopTouch, { passive: false });

    return () => {
      shelf.removeEventListener('wheel', stopWheel);
      el.removeEventListener('wheel', stopWheel);
      el.removeEventListener('touchmove', stopTouch);
    };
  }, []);

  const handlePrev = () => {
    if (onNavigateLeft) {
      onNavigateLeft();
      return;
    }
    if (games.length === 0) return;
    const curIdx = games.findIndex((g) => g.id === activeGameId);
    const prevIdx = curIdx <= 0 ? games.length - 1 : curIdx - 1;
    onHoverGame(games[prevIdx]);
  };

  const handleNext = () => {
    if (onNavigateRight) {
      onNavigateRight();
      return;
    }
    if (games.length === 0) return;
    const curIdx = games.findIndex((g) => g.id === activeGameId);
    const nextIdx = curIdx >= games.length - 1 ? 0 : curIdx + 1;
    onHoverGame(games[nextIdx]);
  };

  return (
    <div ref={shelfRef} className="relative group/shelf mt-auto pt-2 sm:pt-4 pb-2 sm:pb-4 select-none">
      <h2 className="sr-only">Полка игр</h2>

      {isLoopable && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="flex absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/85 hover:bg-white text-zinc-200 hover:text-zinc-950 items-center justify-center backdrop-blur-md opacity-90 hover:opacity-100 transition-all shadow-2xl cursor-pointer border border-white/20 hover:border-white active:scale-95"
            title="Предыдущая игра"
            aria-label="Предыдущая игра"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex absolute right-1 sm:right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/85 hover:bg-white text-zinc-200 hover:text-zinc-950 items-center justify-center backdrop-blur-md opacity-90 hover:opacity-100 transition-all shadow-2xl cursor-pointer border border-white/20 hover:border-white active:scale-95"
            title="Следующая игра"
            aria-label="Следующая игра"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-r from-[#050608]/90 to-transparent z-20" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 sm:w-16 bg-gradient-to-l from-[#050608]/90 to-transparent z-20" />

      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 sm:gap-4 overflow-x-hidden no-scrollbar py-6 sm:py-8 px-4 sm:px-6 touch-none overscroll-none"
      >
        {displayItems.map(({ game, copyIdx, itemIdx, uid }) => {
          const isActive = game.id === activeGameId && copyIdx === activeCopyIdx;
          const status = getStatus(game.id);

          return (
            <div
              key={uid}
              ref={setCardRef(uid)}
              onClick={(e) => {
                e.stopPropagation();
                activeCopyRef.current = copyIdx;
                setActiveCopyIdx(copyIdx);
                scrollToCard(copyIdx, itemIdx, game.id, true);
                onHoverGame(game);
                onSelectGame(game);
              }}
              className={`relative shrink-0 w-32 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 select-none ${
                isActive
                  ? 'scale-105 shadow-[0_20px_45px_rgba(0,0,0,0.95)] -translate-y-2 z-10 brightness-110 ring-2 ring-white/90 shadow-white/10'
                  : 'opacity-70 hover:opacity-100 hover:scale-102 hover:-translate-y-1 shadow-lg shadow-black/40 ring-1 ring-white/10'
              }`}
            >
              <img
                src={game.background_image || FALLBACK_IMAGE}
                alt={game.name}
                width={176}
                height={235}
                loading={copyIdx === BASE_COPY && itemIdx < 4 ? 'eager' : 'lazy'}
                fetchPriority={copyIdx === BASE_COPY && itemIdx === 0 ? 'high' : 'auto'}
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="w-full h-full object-cover object-center pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

              {status && (
                <div className="absolute top-2 left-2 p-1 rounded-md bg-black/60 backdrop-blur-md">
                  {status === 'playing' ? (
                    <Play className="w-3 h-3 text-emerald-400 fill-current" />
                  ) : status === 'completed' ? (
                    <Check className="w-3 h-3 text-blue-400" />
                  ) : (
                    <Bookmark className="w-3 h-3 text-amber-400 fill-current" />
                  )}
                </div>
              )}

              <div className="absolute bottom-2.5 inset-x-2.5 pointer-events-none">
                <p className="text-[11px] sm:text-xs font-bold text-white leading-snug line-clamp-1 drop-shadow">
                  {game.name}
                </p>
                <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-zinc-400 mt-0.5">
                  <span>{game.genres?.[0]?.name}</span>
                  {game.metacritic && (
                    <span className="font-mono font-bold text-white">
                      {game.metacritic}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
