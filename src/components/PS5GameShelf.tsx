import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import type { Game, BacklogStatus } from '../types/game';
import { ChevronLeft, ChevronRight, Bookmark, Play, Check } from 'lucide-react';

interface Props {
  games: Game[];
  activeGameId: number;
  onHoverGame: (game: Game) => void;
  onSelectGame: (game: Game) => void;
  getStatus: (gameId: number) => BacklogStatus | null;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80';

export const PS5GameShelf: React.FC<Props> = ({
  games,
  activeGameId,
  onHoverGame,
  onSelectGame,
  getStatus,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const isMouseDownRef = useRef<boolean>(false);
  const startXRef = useRef<number>(0);
  const startScrollLeftRef = useRef<number>(0);
  const hasDraggedRef = useRef<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Stride of one complete set of games in pixels
  const setWidthRef = useRef<number>(0);
  // Active copy index (0: left clone, 1: primary middle set, 2: right clone)
  const [activeCopyIdx, setActiveCopyIdx] = useState<number>(1);
  const prevActiveGameIdRef = useRef<number>(activeGameId);
  const isProgrammaticScrollingRef = useRef<boolean>(false);

  // Build looping items list: 3 copies for seamless circular scrolling
  const { displayItems, isLoopable } = useMemo(() => {
    if (games.length === 0) return { displayItems: [], isLoopable: false };
    if (games.length === 1) {
      return {
        displayItems: [{ game: games[0], copyIdx: 1, itemIdx: 0, uid: `1-0-${games[0].id}` }],
        isLoopable: false,
      };
    }

    // Ensure 1 set is at least 10 cards so setWidth exceeds any screen viewport
    const repeats = Math.max(1, Math.ceil(10 / games.length));
    const singleSet = Array.from({ length: repeats }, () => games).flat();

    const items: Array<{ game: Game; copyIdx: number; itemIdx: number; uid: string }> = [];
    for (let c = 0; c < 3; c++) {
      singleSet.forEach((game, idx) => {
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

  // Update setWidth based on distance between card 0 of copy 0 and card 0 of copy 1
  const updateSetWidth = useCallback(() => {
    if (!isLoopable || games.length === 0) return;
    const card0 = cardRefs.current.get(`0-0-${games[0].id}`);
    const card1 = cardRefs.current.get(`1-0-${games[0].id}`);
    if (card0 && card1) {
      setWidthRef.current = card1.offsetLeft - card0.offsetLeft;
    }
  }, [isLoopable, games]);

  // Center active card on mount or when games list changes
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || games.length === 0) return;

    updateSetWidth();

    // Center active game in copy 1
    let card: HTMLDivElement | undefined;
    for (const [k, el] of cardRefs.current.entries()) {
      if (k.startsWith('1-') && k.endsWith(`-${activeGameId}`)) {
        card = el;
        break;
      }
    }

    if (!card) {
      card = cardRefs.current.get(`1-0-${games[0].id}`);
    }

    if (card) {
      container.scrollLeft = card.offsetLeft - (container.clientWidth - card.offsetWidth) / 2;
    }
  }, [games, isLoopable, updateSetWidth, activeGameId]);

  // ResizeObserver to keep setWidth updated on container/window resize
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isLoopable) return;

    const ro = new ResizeObserver(() => {
      updateSetWidth();
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, [isLoopable, updateSetWidth]);

  // Seamless boundary wrap during manual scrolling
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    const setWidth = setWidthRef.current;
    if (!container || !isLoopable || !setWidth || setWidth <= 0) return;

    if (isProgrammaticScrollingRef.current) return;

    if (container.scrollLeft >= setWidth * 2) {
      container.scrollLeft -= setWidth;
    } else if (container.scrollLeft < setWidth) {
      container.scrollLeft += setWidth;
    }
  }, [isLoopable]);

  // Wheel horizontal scroll with infinite wrapping
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // Smooth horizontal swipe or Shift+wheel only
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        el.scrollLeft += e.deltaX * 0.85;

        const setWidth = setWidthRef.current;
        if (isLoopable && setWidth > 0) {
          if (el.scrollLeft >= setWidth * 2) {
            el.scrollLeft -= setWidth;
          } else if (el.scrollLeft < setWidth) {
            el.scrollLeft += setWidth;
          }
        }
      } else if (e.shiftKey && Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 0.85;

        const setWidth = setWidthRef.current;
        if (isLoopable && setWidth > 0) {
          if (el.scrollLeft >= setWidth * 2) {
            el.scrollLeft -= setWidth;
          } else if (el.scrollLeft < setWidth) {
            el.scrollLeft += setWidth;
          }
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [isLoopable]);

  // Active game navigation & smooth scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || games.length === 0) {
      prevActiveGameIdRef.current = activeGameId;
      return;
    }

    const prevGameId = prevActiveGameIdRef.current;
    prevActiveGameIdRef.current = activeGameId;

    if (!isLoopable) {
      const card = cardRefs.current.get(`1-0-${activeGameId}`);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
      return;
    }

    const prevIdx = games.findIndex((g) => g.id === prevGameId);
    const curIdx = games.findIndex((g) => g.id === activeGameId);

    if (curIdx === -1) return;

    // Detect circular boundary wrap
    const isWrapForward = prevIdx === games.length - 1 && curIdx === 0;
    const isWrapBackward = prevIdx === 0 && curIdx === games.length - 1;

    let targetCopy = 1;
    if (isWrapForward) {
      targetCopy = 2; // Glide forward into right clone
    } else if (isWrapBackward) {
      targetCopy = 0; // Glide backward into left clone
    }

    setActiveCopyIdx(targetCopy);

    // Find target card in the chosen copy
    let targetCard: HTMLDivElement | undefined;
    for (const [k, el] of cardRefs.current.entries()) {
      if (k.startsWith(`${targetCopy}-`) && k.endsWith(`-${activeGameId}`)) {
        targetCard = el;
        break;
      }
    }

    if (targetCard) {
      const cardLeft = targetCard.offsetLeft;
      const cardRight = cardLeft + targetCard.offsetWidth;
      const containerLeft = container.scrollLeft;
      const containerRight = containerLeft + container.clientWidth;

      const isOutOfView = cardLeft < containerLeft + 30 || cardRight > containerRight - 30;

      if (isWrapForward || isWrapBackward || isOutOfView) {
        isProgrammaticScrollingRef.current = true;
        const targetScrollLeft = targetCard.offsetLeft - (container.clientWidth - targetCard.offsetWidth) / 2;

        container.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth',
        });

        let isDone = false;
        const finishScroll = () => {
          if (isDone) return;
          isDone = true;
          container.removeEventListener('scrollend', finishScroll);

          if (!scrollContainerRef.current || !setWidthRef.current) {
            isProgrammaticScrollingRef.current = false;
            return;
          }
          const currentSetWidth = setWidthRef.current;

          // Normalize back to copy 1 seamlessly
          if (targetCopy === 2) {
            scrollContainerRef.current.scrollLeft -= currentSetWidth;
            setActiveCopyIdx(1);
          } else if (targetCopy === 0) {
            scrollContainerRef.current.scrollLeft += currentSetWidth;
            setActiveCopyIdx(1);
          }
          isProgrammaticScrollingRef.current = false;
        };

        container.addEventListener('scrollend', finishScroll, { once: true });
        const timer = setTimeout(finishScroll, 380);

        return () => {
          isDone = true;
          container.removeEventListener('scrollend', finishScroll);
          clearTimeout(timer);
        };
      }
    }
  }, [activeGameId, games, isLoopable]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollContainerRef.current) return;
    isMouseDownRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    startScrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    hasDraggedRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDownRef.current || !scrollContainerRef.current) return;
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 4) {
      hasDraggedRef.current = true;
      if (!isDragging) setIsDragging(true);
    }
    const container = scrollContainerRef.current;
    container.scrollLeft = startScrollLeftRef.current - walk;

    const setWidth = setWidthRef.current;
    if (isLoopable && setWidth > 0) {
      if (container.scrollLeft >= setWidth * 2) {
        container.scrollLeft -= setWidth;
        startScrollLeftRef.current -= setWidth;
      } else if (container.scrollLeft < setWidth) {
        container.scrollLeft += setWidth;
        startScrollLeftRef.current += setWidth;
      }
    }
  };

  const handleMouseUpOrLeave = () => {
    isMouseDownRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
      setIsDragging(false);
    }, 60);
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const setWidth = setWidthRef.current;
    if (isLoopable && setWidth > 0) {
      if (direction === 'right' && container.scrollLeft >= setWidth * 2 - 400) {
        container.scrollLeft -= setWidth;
      } else if (direction === 'left' && container.scrollLeft <= setWidth + 400) {
        container.scrollLeft += setWidth;
      }
    }

    const offset = direction === 'left' ? -350 : 350;
    container.scrollBy({ left: offset, behavior: 'smooth' });
  };

  return (
    <div className="relative group/shelf mt-auto pt-2 sm:pt-4 pb-4 sm:pb-8">
      <h2 className="sr-only">Полка игр</h2>
      <button
        type="button"
        onClick={() => scroll('left')}
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/85 hover:bg-white text-zinc-300 hover:text-zinc-950 items-center justify-center backdrop-blur-md opacity-0 group-hover/shelf:opacity-100 transition-all shadow-2xl cursor-pointer"
        title="Прокрутить влево"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        type="button"
        onClick={() => scroll('right')}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/85 hover:bg-white text-zinc-300 hover:text-zinc-950 items-center justify-center backdrop-blur-md opacity-0 group-hover/shelf:opacity-100 transition-all shadow-2xl cursor-pointer"
        title="Прокрутить вправо"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-3 sm:py-4 px-1 sm:px-2 touch-pan-x overscroll-x-contain ${
          isDragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
      >
        {displayItems.map(({ game, copyIdx, itemIdx, uid }) => {
          const isActive =
            game.id === activeGameId &&
            copyIdx === activeCopyIdx &&
            itemIdx < games.length;
          const status = getStatus(game.id);

          return (
            <div
              key={uid}
              ref={setCardRef(uid)}
              onClick={(e) => {
                e.stopPropagation();
                if (hasDraggedRef.current) return;
                if (copyIdx === 2 && setWidthRef.current && scrollContainerRef.current) {
                  scrollContainerRef.current.scrollLeft -= setWidthRef.current;
                  setActiveCopyIdx(1);
                } else if (copyIdx === 0 && setWidthRef.current && scrollContainerRef.current) {
                  scrollContainerRef.current.scrollLeft += setWidthRef.current;
                  setActiveCopyIdx(1);
                } else {
                  setActiveCopyIdx(copyIdx);
                }
                onHoverGame(game);
                if (isActive) {
                  onSelectGame(game);
                }
              }}
              className={`relative shrink-0 w-32 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 select-none ${
                isActive
                  ? 'scale-103 sm:scale-105 shadow-[0_20px_50px_rgba(0,0,0,0.95)] -translate-y-1.5 sm:-translate-y-2 z-10 brightness-110'
                  : 'opacity-70 hover:opacity-100 hover:scale-102 hover:-translate-y-1 shadow-lg shadow-black/40'
              }`}
            >
              <img
                src={game.background_image || FALLBACK_IMAGE}
                alt={game.name}
                width={176}
                height={235}
                loading={copyIdx === 1 && itemIdx < 4 ? 'eager' : 'lazy'}
                fetchPriority={copyIdx === 1 && itemIdx === 0 ? 'high' : 'auto'}
                decoding="async"
                onError={(e) => {
                  e.currentTarget.src = FALLBACK_IMAGE;
                }}
                className="w-full h-full object-cover object-center pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

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
