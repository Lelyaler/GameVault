import React, { useState, useEffect, useCallback } from 'react';
import type { Game, BacklogStatus } from '../types/game';
import { PlatformIcons } from './PlatformIcons';
import { CriticScore } from './CriticScore';
import { Badge } from './ui/Badge';
import { GameHeroBanner } from './game-details/GameHeroBanner';
import { GameOverviewTab } from './game-details/GameOverviewTab';
import { GameMediaGallery } from './game-details/GameMediaGallery';
import { GameSpecsTab } from './game-details/GameSpecsTab';
import { X, ExternalLink } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface Props {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  userStatus?: BacklogStatus | null;
  userRating?: number;
  userNote?: string;
  onUpdateStatus?: (game: Game, status: BacklogStatus | null) => void;
  onUpdateRating?: (gameId: number, rating: number) => void;
  onUpdateNote?: (gameId: number, note: string) => void;
  onOpenCompare?: (game: Game) => void;
}

const MODAL_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80';

export const GameDetailsModal: React.FC<Props> = ({
  game,
  isOpen,
  onClose,
  userStatus = null,
  userRating = 0,
  userNote = '',
  onUpdateStatus,
  onUpdateRating,
  onUpdateNote,
  onOpenCompare,
}) => {
  const [prevGameId, setPrevGameId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'screenshots' | 'trailer' | 'specs'>('overview');
  const [activePreviewImage, setActivePreviewImage] = useState<string | null>(null);
  const [bannerFit, setBannerFit] = useState<'cover' | 'contain'>('cover');
  const [noteText, setNoteText] = useState(userNote);

  if (game && game.id !== prevGameId) {
    setPrevGameId(game.id);
    setActiveTab('overview');
    setActivePreviewImage(null);
    setBannerFit('cover');
    setNoteText(userNote);
  }

  const handleClose = useCallback(() => {
    sounds.playBack();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  if (!isOpen || !game) return null;

  const releaseYear = game.released ? new Date(game.released).getFullYear() : null;
  const bannerImage = game.backdrop_image || game.background_image || MODAL_FALLBACK_IMAGE;

  const screenshots: { id: number; image: string }[] = [];
  if (game.backdrop_image) screenshots.push({ id: 101, image: game.backdrop_image });
  if (game.background_image && game.background_image !== game.backdrop_image) {
    screenshots.push({ id: 102, image: game.background_image });
  }
  if (game.short_screenshots?.length) {
    game.short_screenshots.forEach((s, idx) => {
      if (!screenshots.some((item) => item.image === s.image)) {
        screenshots.push({ id: s.id || idx + 1, image: s.image });
      }
    });
  }
  if (screenshots.length === 0) {
    screenshots.push({ id: 1, image: bannerImage });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 lg:p-8 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-5xl bg-zinc-950 sm:bg-zinc-900 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.95)] z-10 h-[94vh] sm:h-auto sm:max-h-[92vh] flex flex-col">
        <div className="sm:hidden w-12 h-1 rounded-full bg-white/20 mx-auto my-2 shrink-0" />

        <button
          type="button"
          onClick={handleClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 p-2 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all hover:scale-103 shadow-md cursor-pointer"
          title="Закрыть (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {activeTab !== 'trailer' && (
          <GameHeroBanner
            game={game}
            bannerImage={bannerImage}
            bannerFit={bannerFit}
            onToggleBannerFit={() => setBannerFit((p) => (p === 'cover' ? 'contain' : 'cover'))}
            onOpenArtPreview={(img) => setActivePreviewImage(img)}
            onOpenTrailer={() => {
              sounds.playNav();
              setActiveTab('trailer');
            }}
            releaseYear={releaseYear}
          />
        )}

        {activeTab === 'trailer' && (
          <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 flex items-center justify-between bg-zinc-950/90 shrink-0 pr-14 sm:pr-16">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <PlatformIcons platforms={game.parent_platforms} />
                <CriticScore score={game.metacritic} />
                {releaseYear && <Badge variant="neutral">{releaseYear}</Badge>}
                <Badge variant="accent">Трейлер</Badge>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                {game.name}
              </h2>
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 bg-zinc-900/90 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => {
              sounds.playNav();
              setActiveTab('overview');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
          >
            Обзор
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playNav();
              setActiveTab('trailer');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'trailer'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
          >
            Трейлер
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playNav();
              setActiveTab('screenshots');
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'screenshots'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
            }`}
          >
            Скриншоты ({screenshots.length})
          </button>

          {game.pc_requirements && (
            <button
              type="button"
              onClick={() => {
                sounds.playNav();
                setActiveTab('specs');
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTab === 'specs'
                  ? 'bg-white text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
              }`}
            >
              Системные требования
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              sounds.playSelect();
              onOpenCompare?.(game);
            }}
            className="ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all bg-white/10 hover:bg-white text-white hover:text-zinc-950 shadow-sm shrink-0 cursor-pointer"
            title="Сравнить характеристики и требования с другой игрой"
          >
            Сравнить игру
          </button>
        </div>

        <div
          className={`overflow-y-auto ${
            activeTab === 'trailer'
              ? 'p-3 sm:p-5 flex-1 flex flex-col justify-center'
              : 'p-5 sm:p-6 space-y-5'
          }`}
        >
          {activeTab === 'overview' && (
            <GameOverviewTab
              game={game}
              releaseYear={releaseYear}
              userStatus={userStatus}
              userRating={userRating}
              noteText={noteText}
              onUpdateNoteText={setNoteText}
              onUpdateStatus={onUpdateStatus}
              onUpdateRating={onUpdateRating}
              onUpdateNote={onUpdateNote}
            />
          )}

          {activeTab === 'trailer' && (
            <div className="w-full flex-1 flex flex-col items-center justify-center">
              {game.trailer_url ? (
                <div className="w-full flex flex-col items-center">
                  <div
                    className="relative w-full aspect-video mx-auto rounded-2xl overflow-hidden bg-black shadow-2xl"
                    style={{
                      maxHeight: 'calc(88vh - 200px)',
                      maxWidth: 'calc((88vh - 200px) * 16 / 9)',
                    }}
                  >
                    <iframe
                      src={`${game.trailer_url.includes('?') ? game.trailer_url : `${game.trailer_url}?`}autoplay=1&enablejsapi=1&rel=0`}
                      title={`${game.name} Official Trailer`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between w-full max-w-2xl px-2 flex-wrap gap-2">
                    <span className="text-xs text-zinc-400">
                      Официальный трейлер игры
                    </span>
                    <a
                      href={game.trailer_url.replace('/embed/', '/watch?v=').replace('youtube-nocookie.com', 'youtube.com')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold transition-all border border-white/10"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Открыть на YouTube</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="py-20 text-center text-zinc-400 bg-zinc-800/30 rounded-2xl space-y-2 max-w-md w-full mx-auto p-6">
                  <p className="text-base font-semibold text-zinc-200">Официальный видеоролик пока не добавлен</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Вы можете посмотреть скриншоты геймплея и системные требования во вкладках выше.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'screenshots' && (
            <GameMediaGallery
              screenshots={screenshots}
              onSelectImage={(img) => setActivePreviewImage(img)}
            />
          )}

          {activeTab === 'specs' && (
            <GameSpecsTab game={game} />
          )}
        </div>
      </div>

      {activePreviewImage && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-8 bg-black/95 backdrop-blur-xl animate-fadeIn"
          onClick={() => setActivePreviewImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[95vh] sm:max-h-[92vh] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-950 shadow-2xl flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activePreviewImage}
              alt="Full Resolution View"
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain select-none"
            />
            <button
              type="button"
              onClick={() => setActivePreviewImage(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-xl transition-all shadow-lg hover:scale-105 cursor-pointer"
              title="Закрыть просмотр (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
