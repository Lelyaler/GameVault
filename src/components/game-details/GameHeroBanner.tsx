import React from 'react';
import type { Game } from '../../types/game';
import { PlatformIcons } from '../PlatformIcons';
import { CriticScore } from '../CriticScore';
import { Badge } from '../ui/Badge';
import { Play } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

const MODAL_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80';

interface GameHeroBannerProps {
  game: Game;
  bannerImage: string;
  bannerFit: 'cover' | 'contain';
  onToggleBannerFit: () => void;
  onOpenArtPreview: (img: string) => void;
  onOpenTrailer?: () => void;
  releaseYear: number | null;
}

export const GameHeroBanner: React.FC<GameHeroBannerProps> = ({
  game,
  bannerImage,
  bannerFit,
  onToggleBannerFit,
  onOpenArtPreview,
  onOpenTrailer,
  releaseYear,
}) => {
  return (
    <div className="relative">
      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-30 flex items-center gap-2">
        {game.trailer_url && onOpenTrailer && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              sounds.playSelect();
              onOpenTrailer();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all hover:scale-103 shadow-md backdrop-blur-md cursor-pointer"
            title="Воспроизвести официальный видеоролик / трейлер"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Трейлер</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            sounds.playSelect();
            onOpenArtPreview(bannerImage);
          }}
          className="inline-flex items-center px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all hover:scale-103 shadow-md backdrop-blur-md cursor-pointer"
          title="Открыть арт целиком в полном разрешении"
        >
          <span>Открыть арт</span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sounds.playNav();
            onToggleBannerFit();
          }}
          className="inline-flex items-center px-2.5 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all hover:scale-103 shadow-md backdrop-blur-md cursor-pointer"
          title={bannerFit === 'cover' ? 'Показать всё изображение без обрезки краев' : 'Заполнить баннер'}
        >
          <span>{bannerFit === 'cover' ? 'Без обрезки' : 'Заполнить'}</span>
        </button>
      </div>

      <div
        onClick={() => {
          sounds.playSelect();
          onOpenArtPreview(bannerImage);
        }}
        className="relative h-64 sm:h-96 md:h-[430px] lg:h-[480px] w-full overflow-hidden shrink-0 bg-zinc-950 cursor-pointer group/hero"
        title="Кликните, чтобы открыть арт в полном разрешении"
      >
        {bannerFit === 'contain' && (
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-110 pointer-events-none"
            style={{ backgroundImage: `url(${bannerImage})` }}
          />
        )}
        <img
          src={bannerImage}
          alt={game.name}
          onError={(e) => {
            e.currentTarget.src = MODAL_FALLBACK_IMAGE;
          }}
          className={`w-full h-full ${
            bannerFit === 'contain'
              ? 'object-contain relative z-10'
              : 'object-cover object-[center_top] group-hover/hero:scale-101'
          } transition-all duration-500`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 via-20% to-transparent pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/60 via-transparent to-transparent pointer-events-none z-10" />

        <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 right-4 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 pointer-events-none z-20">
          <div className="max-w-3xl pointer-events-auto flex items-end gap-3.5 sm:gap-4.5">
            {game.background_image && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  sounds.playSelect();
                  onOpenArtPreview(game.background_image);
                }}
                className="hidden sm:block shrink-0 w-20 md:w-24 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-zinc-900 ring-1 ring-white/15 cursor-pointer hover:scale-105 active:scale-95 transition-all"
                title="Нажмите, чтобы открыть обложку игры"
              >
                <img
                  src={game.background_image}
                  alt={`${game.name} cover`}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2 flex-wrap">
                <PlatformIcons platforms={game.parent_platforms} />
                <CriticScore score={game.metacritic} />
                {releaseYear && <Badge variant="neutral">{releaseYear}</Badge>}
                {game.genres?.[0] && <Badge variant="default">{game.genres[0].name}</Badge>}
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                {game.name}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
