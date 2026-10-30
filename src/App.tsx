import { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { PS5Header } from './components/PS5Header';
import { PS5Backdrop } from './components/PS5Backdrop';
import { PS5Spotlight } from './components/PS5Spotlight';
import { PS5GameShelf } from './components/PS5GameShelf';
import { GameCard } from './components/GameCard';
import { GameCardSkeleton } from './components/GameCardSkeleton';
import { CatalogFilterBar } from './components/CatalogFilterBar';
import { ModalLayer, type ActiveModalType } from './components/ModalLayer';
import { Toast } from './components/Toast';
import { filterGames } from './utils/gameFilters';
import { useGames } from './hooks/useGames';
import { useGenres } from './hooks/useGenres';
import { useBacklog } from './hooks/useBacklog';
import { useUrlSync, getInitialUrlState } from './hooks/useUrlSync';
import { useGamepad } from './hooks/useGamepad';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useLibraryActions } from './hooks/useLibraryActions';
import { sounds } from './utils/soundEffects';
import type { Game, GameQuery, BacklogStatus } from './types/game';
import { AlertCircle } from 'lucide-react';

const LibraryDashboard = lazy(() =>
  import('./components/LibraryDashboard').then((m) => ({ default: m.LibraryDashboard }))
);

function App() {
  const initialUrlState = useMemo(() => getInitialUrlState(), []);

  const [gameQuery, setGameQuery] = useState<GameQuery>(initialUrlState.gameQuery);
  const [selectedGameSlug, setSelectedGameSlug] = useState<string | null>(
    () => initialUrlState.gameSlug
  );
  const [selectedGameManual, setSelectedGameManual] = useState<Game | null>(null);
  const [focusedGame, setFocusedGame] = useState<Game | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(
    initialUrlState.showFavoritesOnly
  );
  const [activeBacklogTab, setActiveBacklogTab] = useState<BacklogStatus | 'all'>('all');
  const [activeModal, setActiveModal] = useState<ActiveModalType>(null);
  const [compareGame, setCompareGame] = useState<Game | null>(null);
  const [viewMode, setViewMode] = useState<'console' | 'grid'>('console');
  const [isNarrowScreen, setIsNarrowScreen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState<number>(0);
  const [visibleCount, setVisibleCount] = useState<number>(12);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsNarrowScreen(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const effectiveViewMode = isNarrowScreen ? 'grid' : viewMode;

  const { games, error, isLoading } = useGames(gameQuery, reloadCounter);
  const { genres } = useGenres();
  const {
    entries,
    updateStatus,
    updateRating,
    updateNote,
    getStatus,
    getRating,
    getNote,
    importEntries,
    stats,
  } = useBacklog();

  const selectedGame = useMemo(() => {
    if (selectedGameManual) return selectedGameManual;
    if (selectedGameSlug && games.length > 0) {
      return games.find((g) => g.slug === selectedGameSlug) || null;
    }
    return null;
  }, [selectedGameManual, selectedGameSlug, games]);

  const currentFocusedGame = useMemo(() => {
    if (focusedGame) return focusedGame;
    if (selectedGame) return selectedGame;
    if (games.length === 0) return null;
    return games.find((g) => g.slug === 'the-witcher-3-wild-hunt') || games[0];
  }, [focusedGame, selectedGame, games]);

  const handleSelectGame = useCallback((game: Game | null) => {
    setSelectedGameManual(game);
    setSelectedGameSlug(game ? game.slug : null);
    if (game) setFocusedGame(game);
  }, []);

  const handleRestoreState = useCallback(
    (state: {
      showFavoritesOnly: boolean;
      gameQuery: GameQuery;
      gameSlug: string | null;
    }) => {
      setShowFavoritesOnly(state.showFavoritesOnly);
      setGameQuery(state.gameQuery);
      setSelectedGameSlug(state.gameSlug);
      if (!state.gameSlug) {
        setSelectedGameManual(null);
      } else {
        const found = games.find((g) => g.slug === state.gameSlug);
        if (found) {
          setSelectedGameManual(found);
          setFocusedGame(found);
        }
      }
    },
    [games]
  );

  useUrlSync({
    showFavoritesOnly,
    gameQuery,
    selectedGameSlug: selectedGame?.slug || null,
    onRestoreState: handleRestoreState,
  });

  const filteredCatalogGames = useMemo(
    () => filterGames(games, gameQuery),
    [games, gameQuery]
  );

  const libraryGames = useMemo(() => {
    let list = entries;
    if (activeBacklogTab !== 'all') {
      list = list.filter((e) => e.status === activeBacklogTab);
    }
    if (gameQuery.searchText) {
      const q = gameQuery.searchText.toLowerCase();
      list = list.filter((e) => e.game.name.toLowerCase().includes(q));
    }
    return list.map((e) => e.game);
  }, [entries, activeBacklogTab, gameQuery.searchText]);

  const displayedGames = showFavoritesOnly ? libraryGames : filteredCatalogGames;
  const isModalOpen = Boolean(selectedGame || compareGame || activeModal);

  const handleCloseActiveModal = useCallback(() => {
    if (selectedGame) {
      sounds.playBack();
      handleSelectGame(null);
      return;
    }
    if (compareGame) {
      sounds.playBack();
      setCompareGame(null);
      return;
    }
    if (activeModal) {
      sounds.playBack();
      setActiveModal(null);
    }
  }, [selectedGame, compareGame, activeModal, handleSelectGame]);

  const handleNavigateLeft = useCallback(() => {
    if (displayedGames.length === 0) return;
    sounds.playNav();
    const curIdx = displayedGames.findIndex((g) => g.id === currentFocusedGame?.id);
    const nextIdx = curIdx <= 0 ? displayedGames.length - 1 : curIdx - 1;
    setFocusedGame(displayedGames[nextIdx]);
  }, [displayedGames, currentFocusedGame]);

  const handleNavigateRight = useCallback(() => {
    if (displayedGames.length === 0) return;
    sounds.playNav();
    const curIdx = displayedGames.findIndex((g) => g.id === currentFocusedGame?.id);
    const nextIdx = curIdx >= displayedGames.length - 1 ? 0 : curIdx + 1;
    setFocusedGame(displayedGames[nextIdx]);
  }, [displayedGames, currentFocusedGame]);

  const handleUpdateGameStatus = useCallback(
    (game: Game, nextStatus: BacklogStatus | null) => {
      sounds.playSelect();
      updateStatus(game, nextStatus);
      const labels: Record<BacklogStatus, string> = {
        playing: 'Играю',
        backlog: 'В планах',
        completed: 'Пройдено',
      };
      showToast(
        nextStatus ? `Статус обновлен: ${labels[nextStatus]}` : 'Удалено из бэклога'
      );
    },
    [updateStatus, showToast]
  );

  const handleGamepadToggleStatus = useCallback(() => {
    if (currentFocusedGame) {
      const current = getStatus(currentFocusedGame.id);
      const nextStatus: BacklogStatus | null =
        current === null
          ? 'playing'
          : current === 'playing'
          ? 'backlog'
          : current === 'backlog'
          ? 'completed'
          : null;
      handleUpdateGameStatus(currentFocusedGame, nextStatus);
    }
  }, [currentFocusedGame, getStatus, handleUpdateGameStatus]);

  const handleGamepadRandomGame = useCallback(() => {
    if (displayedGames.length === 0) return;
    const randomIndex = Math.floor(Math.random() * displayedGames.length);
    sounds.playSelect();
    setFocusedGame(displayedGames[randomIndex]);
  }, [displayedGames]);

  const { isConnected: isGamepadConnected, gamepadName } = useGamepad({
    onNavigateLeft: handleNavigateLeft,
    onNavigateRight: handleNavigateRight,
    onSelect: () => {
      if (!isModalOpen && currentFocusedGame) {
        sounds.playSelect();
        handleSelectGame(currentFocusedGame);
      }
    },
    onBack: handleCloseActiveModal,
    onToggleStatus: handleGamepadToggleStatus,
    onRandomGame: handleGamepadRandomGame,
  });

  useKeyboardShortcuts({
    isModalOpen,
    effectiveViewMode,
    hasActiveGame: Boolean(currentFocusedGame),
    onNavigateLeft: handleNavigateLeft,
    onNavigateRight: handleNavigateRight,
    onSelectGame: () => {
      if (currentFocusedGame) {
        sounds.playSelect();
        handleSelectGame(currentFocusedGame);
      }
    },
    onCloseModal: handleCloseActiveModal,
  });

  const {
    handleShareLibrary,
    handleExportJson,
    handleImportJson,
    handleImportSteamEntries,
  } = useLibraryActions({
    entries,
    totalStatsCount: stats.total,
    playingCount: stats.playing,
    completedCount: stats.completed,
    importEntries,
    showToast,
  });

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col relative selection:bg-white selection:text-black">
      <PS5Backdrop activeGame={currentFocusedGame} />

      <PS5Header
        activeTab={showFavoritesOnly ? 'library' : 'catalog'}
        onSelectTab={(tab) => {
          sounds.playSelect();
          setShowFavoritesOnly(tab === 'library');
        }}
        searchText={gameQuery.searchText || ''}
        onSearch={(text) =>
          setGameQuery((prev) => ({ ...prev, searchText: text }))
        }
        onOpenSettings={() => {
          sounds.playSelect();
          setActiveModal('settings');
        }}
        libraryCount={stats.total}
        isGamepadConnected={isGamepadConnected}
        gamepadName={gamepadName}
      />

      <main
        className={`relative z-10 flex-1 flex flex-col ${
          effectiveViewMode === 'console' ? 'lg:justify-between' : ''
        } px-3 sm:px-8 max-w-[1600px] w-full mx-auto pb-[calc(3.5rem+env(safe-area-inset-bottom,0px))]`}
      >
        {showFavoritesOnly ? (
          <div className="py-4 sm:py-6 animate-fadeIn">
            <Suspense fallback={null}>
              <LibraryDashboard
                stats={stats}
                activeTab={activeBacklogTab}
                onSelectTab={setActiveBacklogTab}
                onShareLibrary={handleShareLibrary}
                onExportJson={handleExportJson}
                onImportJson={handleImportJson}
                onOpenSteamImport={() => setActiveModal('steam')}
              />
            </Suspense>

            <h2 className="sr-only">Избранные игры</h2>
            {displayedGames.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5">
                {displayedGames.map((game, idx) => (
                  <GameCard
                    key={game.id}
                    game={game}
                    priority={idx === 0}
                    userStatus={getStatus(game.id)}
                    onUpdateStatus={handleUpdateGameStatus}
                    onSelectGame={(g) => {
                      sounds.playSelect();
                      handleSelectGame(g);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="py-16 sm:py-24 text-center">
                <p className="text-zinc-400 text-xs sm:text-sm">
                  В этом разделе пока нет игр. Добавьте игры из каталога!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div
            className={`flex-1 flex flex-col ${
              effectiveViewMode === 'console' ? 'lg:justify-between' : ''
            }`}
          >
            {currentFocusedGame && !gameQuery.searchText && (
              <PS5Spotlight
                game={currentFocusedGame}
                userStatus={getStatus(currentFocusedGame.id)}
                onOpenDetails={(game) => {
                  sounds.playSelect();
                  handleSelectGame(game);
                }}
                onUpdateStatus={handleUpdateGameStatus}
                onOpenCompare={(g) => setCompareGame(g)}
              />
            )}

            <div className="pt-3 sm:pt-6 pb-2">
              <CatalogFilterBar
                gameQuery={gameQuery}
                onUpdateQuery={setGameQuery}
                genres={genres}
                totalGamesCount={displayedGames.length}
                viewMode={effectiveViewMode}
                onViewModeChange={setViewMode}
              />
            </div>

            {error && (
              <div className="my-3 p-3.5 rounded-xl bg-rose-950/60 text-rose-300 text-xs flex items-center gap-2 shadow-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {effectiveViewMode === 'console' ? (
              <PS5GameShelf
                games={displayedGames}
                activeGameId={currentFocusedGame?.id || 0}
                onHoverGame={setFocusedGame}
                onSelectGame={handleSelectGame}
                getStatus={getStatus}
              />
            ) : (
              <div className="py-3 sm:py-6">
                <h2 className="sr-only">Каталог игр</h2>
                {isLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <GameCardSkeleton key={i} />
                    ))}
                  </div>
                ) : displayedGames.length > 0 ? (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4.5">
                      {displayedGames.slice(0, visibleCount).map((game, idx) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          priority={idx === 0}
                          userStatus={getStatus(game.id)}
                          onUpdateStatus={handleUpdateGameStatus}
                          onSelectGame={handleSelectGame}
                        />
                      ))}
                    </div>
                    {displayedGames.length > visibleCount && (
                      <div className="mt-8 flex justify-center">
                        <button
                          type="button"
                          onClick={() => setVisibleCount((prev) => prev + 12)}
                          className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold shadow-sm transition-all border border-white/10 hover:border-white/20 active:scale-98 cursor-pointer"
                        >
                          Показать ещё ({displayedGames.length - visibleCount})
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-16 sm:py-20 text-center text-zinc-400 text-xs sm:text-sm">
                    Игры не найдены. Попробуйте изменить фильтры.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      <ModalLayer
        activeModal={activeModal}
        onCloseModal={() => setActiveModal(null)}
        selectedGame={selectedGame}
        onCloseSelectedGame={() => handleSelectGame(null)}
        onSelectGame={handleSelectGame}
        compareGame={compareGame}
        onCloseCompareGame={() => setCompareGame(null)}
        onOpenCompare={setCompareGame}
        catalog={games}
        getStatus={getStatus}
        getRating={getRating}
        getNote={getNote}
        updateStatus={handleUpdateGameStatus}
        updateRating={updateRating}
        updateNote={updateNote}
        onImportSteamEntries={handleImportSteamEntries}
        onApiKeySaved={() => setReloadCounter((c) => c + 1)}
      />

      <footer className="hidden md:flex fixed bottom-0 inset-x-0 h-[calc(2.25rem+env(safe-area-inset-bottom,0px))] pb-[env(safe-area-inset-bottom,0px)] bg-zinc-950/80 backdrop-blur-md shadow-[0_-8px_24px_rgba(0,0,0,0.6)] z-30 px-4 sm:px-8 items-center justify-between text-xs text-zinc-400 select-none">
        <div className="flex items-center gap-2">
          {isGamepadConnected ? (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-zinc-200">{gamepadName || 'Контроллер'}</span>
            </div>
          ) : (
            <span className="text-[11px] text-zinc-500 font-medium">GameVault PS5 Experience</span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium text-zinc-400">
          {isGamepadConnected ? (
            <>
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 font-bold">◀ ▶</kbd> Навигация</span>
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-emerald-400 font-bold">✕</kbd> Выбрать</span>
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-rose-400 font-bold">○</kbd> Назад</span>
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-sky-400 font-bold">□</kbd> Статус</span>
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-amber-400 font-bold">△</kbd> Случайная</span>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono text-[10px]">◀ ▶</kbd> Выбор</span>
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono text-[10px]">Enter</kbd> Открыть</span>
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono text-[10px]">/</kbd> Поиск</span>
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono text-[10px]">Esc</kbd> Закрыть</span>
            </>
          )}
        </div>
      </footer>

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}

export default App;
