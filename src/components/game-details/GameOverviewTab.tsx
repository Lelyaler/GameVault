import React from 'react';
import type { Game, BacklogStatus } from '../../types/game';
import { Play, Clock, Check, Star } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface GameOverviewTabProps {
  game: Game;
  releaseYear: number | null;
  userStatus: BacklogStatus | null;
  userRating: number;
  noteText: string;
  onUpdateNoteText: (val: string) => void;
  onUpdateStatus?: (game: Game, status: BacklogStatus | null) => void;
  onUpdateRating?: (gameId: number, rating: number) => void;
  onUpdateNote?: (gameId: number, note: string) => void;
}

export const GameOverviewTab: React.FC<GameOverviewTabProps> = ({
  game,
  releaseYear,
  userStatus,
  userRating,
  noteText,
  onUpdateNoteText,
  onUpdateStatus,
  onUpdateRating,
  onUpdateNote,
}) => {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="p-3.5 rounded-xl bg-zinc-800/40 shadow-sm">
          <div className="text-[11px] font-medium text-zinc-400">Релиз</div>
          <div className="text-sm sm:text-base font-bold text-zinc-100 mt-0.5 truncate">
            {releaseYear ? `${releaseYear} г.` : 'Н/Д'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-800/40 shadow-sm">
          <div className="text-[11px] font-medium text-emerald-400/80">Metacritic</div>
          <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5 truncate">
            {game.metacritic ? `${game.metacritic} / 100` : '—'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-800/40 shadow-sm">
          <div className="text-[11px] font-medium text-amber-400/80">Рейтинг RAWG</div>
          <div className="text-sm sm:text-base font-bold text-amber-300 mt-0.5 truncate">
            {game.rating > 0 ? `${game.rating.toFixed(1)} / 5` : '—'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-800/40 shadow-sm">
          <div className="text-[11px] font-medium text-purple-400/80">Время игры</div>
          <div className="text-sm sm:text-base font-bold text-zinc-100 mt-0.5 truncate">
            {game.playtime > 0 ? `~${game.playtime} ч.` : '—'}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-zinc-800/40 shadow-sm">
        <div className="w-full sm:w-auto">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1.5">
            Статус в вашей библиотеке
          </span>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onUpdateStatus?.(game, userStatus === 'playing' ? null : 'playing');
              }}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                userStatus === 'playing'
                  ? 'bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'bg-white/[0.05] hover:bg-white/10 text-zinc-300'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Играю</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onUpdateStatus?.(game, userStatus === 'backlog' ? null : 'backlog');
              }}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                userStatus === 'backlog'
                  ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'bg-white/[0.05] hover:bg-white/10 text-zinc-300'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>В планы</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playSelect();
                onUpdateStatus?.(game, userStatus === 'completed' ? null : 'completed');
              }}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition-all ${
                userStatus === 'completed'
                  ? 'bg-blue-500 text-zinc-950 shadow-md shadow-blue-500/20 font-bold'
                  : 'bg-white/[0.05] hover:bg-white/10 text-zinc-300'
              }`}
            >
              <Check className="w-3 h-3" />
              <span>Пройдено</span>
            </button>
          </div>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-1.5 sm:text-right">
            Ваша личная оценка
          </span>
          <div className="flex items-center gap-1.5 sm:gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  sounds.playSelect();
                  onUpdateRating?.(game.id, star === userRating ? 0 : star);
                }}
                className="p-1 sm:p-1 hover:scale-125 active:scale-95 transition-transform"
                title={`${star} из 5 звёзд`}
              >
                <Star
                  className={`w-4 h-4 sm:w-4 sm:h-4 ${
                    star <= (userRating || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-zinc-600 hover:text-yellow-400'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {userStatus && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-800/40 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              Личные заметки к прохождению
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Автосохранение
            </span>
          </div>
          <textarea
            value={noteText}
            onChange={(e) => {
              onUpdateNoteText(e.target.value);
              onUpdateNote?.(game.id, e.target.value);
            }}
            placeholder="Зафиксируйте прогресс, впечатления, билд персонажа или список ачивок..."
            rows={2}
            className="w-full bg-zinc-900/80 hover:bg-zinc-900 focus:bg-zinc-950 text-xs sm:text-sm text-zinc-200 placeholder-zinc-500 rounded-lg p-3 outline-none transition-all resize-none shadow-inner leading-relaxed"
          />
        </div>
      )}

      <div className="space-y-4 pt-1">
        <div>
          <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-500 mb-2">
            Об игре
          </h4>
          <p className="text-sm text-zinc-300 leading-relaxed font-normal whitespace-pre-line">
            {game.description_raw ||
              (game.genres?.length ? `${game.name} — проект в жанре ${game.genres.map((g) => g.name).join(', ')}.` : 'Подробная информация об игре доступна в каталоге.')}
          </p>
        </div>

        {game.genres && game.genres.length > 0 && (
          <div>
            <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-500 mb-2">
              Жанры и теги
            </h4>
            <div className="flex flex-wrap gap-2">
              {game.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-zinc-800 hover:bg-zinc-700/80 text-zinc-200 text-xs px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
