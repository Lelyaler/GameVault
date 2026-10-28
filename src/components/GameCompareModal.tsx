import React, { useState } from 'react';
import type { Game, BacklogStatus } from '../types/game';
import { PlatformIcons } from './PlatformIcons';
import { CriticScore } from './CriticScore';
import { X, Play, Clock, Check } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  gameA: Game;
  catalog: Game[];
  onSelectGame?: (game: Game) => void;
  getStatus?: (gameId: number) => BacklogStatus | null;
  onUpdateStatus?: (game: Game, status: BacklogStatus | null) => void;
}

export const GameCompareModal: React.FC<Props> = ({
  isOpen,
  onClose,
  gameA,
  catalog,
  onSelectGame,
  getStatus,
  onUpdateStatus,
}) => {
  const initialGameB = catalog.find((g) => g.id !== gameA.id) || catalog[0] || gameA;
  const [selectedGameBId, setSelectedGameBId] = useState<number>(initialGameB.id);

  if (!isOpen) return null;

  const gameB = catalog.find((g) => g.id === selectedGameBId) || initialGameB;

  const handleClose = () => {
    sounds.playBack();
    onClose();
  };

  const getYear = (dateStr: string) => (dateStr ? new Date(dateStr).getFullYear() : 'Н/Д');

  const maxPlaytime = Math.max(gameA.playtime || 1, gameB.playtime || 1, 60);

  const renderStatusBadge = (game: Game) => {
    const status = getStatus ? getStatus(game.id) : null;
    if (status === 'playing') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md">
          <Play className="w-2.5 h-2.5 fill-current" /> Играю
        </span>
      );
    }
    if (status === 'backlog') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md">
          <Clock className="w-2.5 h-2.5" /> В планах
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-400 bg-blue-950/60 px-2 py-0.5 rounded-md">
          <Check className="w-2.5 h-2.5" /> Пройдено
        </span>
      );
    }
    return (
      <button
        type="button"
        onClick={() => {
          sounds.playSelect();
          onUpdateStatus?.(game, 'backlog');
        }}
        className="text-[11px] text-zinc-400 hover:text-white px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors"
      >
        + В бэклог
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-4xl max-h-[92vh] bg-zinc-900 rounded-2xl shadow-2xl shadow-black z-10 flex flex-col overflow-hidden text-left">
        <div className="px-5 sm:px-6 py-4 flex items-center justify-between bg-zinc-950/90 shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Сравнение игр
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Сопоставление оценок, времени прохождения, жанров и требований
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-zinc-950 shadow-md relative group">
                <img
                  src={gameA.backdrop_image || gameA.background_image}
                  alt={gameA.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 flex-wrap">
                  {renderStatusBadge(gameA)}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-mono text-zinc-400">{getYear(gameA.released)}</div>
                <h4 className="text-sm sm:text-lg font-bold text-white truncate">{gameA.name}</h4>
              </div>
            </div>

            <div className="space-y-3">
              <div className="aspect-video rounded-xl overflow-hidden bg-zinc-950 shadow-md relative group">
                <img
                  src={gameB.backdrop_image || gameB.background_image}
                  alt={gameB.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 flex-wrap">
                  {renderStatusBadge(gameB)}
                </div>
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">Сравнить с:</label>
                <select
                  value={selectedGameBId}
                  onChange={(e) => {
                    sounds.playNav();
                    setSelectedGameBId(Number(e.target.value));
                  }}
                  className="w-full bg-zinc-800 hover:bg-zinc-750 text-white text-xs sm:text-sm font-semibold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer transition-colors"
                >
                  {catalog
                    .filter((g) => g.id !== gameA.id)
                    .map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({getYear(g.released)})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-zinc-800/40 shadow-sm space-y-2">
              <div className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
                Оценка Metacritic
              </div>
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <CriticScore score={gameA.metacritic} />
                  <span className="text-xs text-zinc-300 font-medium truncate">{gameA.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CriticScore score={gameB.metacritic} />
                  <span className="text-xs text-zinc-300 font-medium truncate">{gameB.name}</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-800/40 shadow-sm space-y-3">
              <div className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
                Среднее время прохождения (кампания)
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-200">~{gameA.playtime || 0} ч</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((gameA.playtime || 0) / maxPlaytime) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-zinc-200">~{gameB.playtime || 0} ч</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-900 overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, ((gameB.playtime || 0) / maxPlaytime) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-800/40 shadow-sm space-y-2">
              <div className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
                Жанры
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {gameA.genres?.map((g) => (
                    <span key={g.id} className="text-xs px-2.5 py-1 rounded-md bg-zinc-850 text-zinc-200">
                      {g.name}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {gameB.genres?.map((g) => (
                    <span key={g.id} className="text-xs px-2.5 py-1 rounded-md bg-zinc-850 text-zinc-200">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-800/40 shadow-sm space-y-2">
              <div className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
                Платформы
              </div>
              <div className="grid grid-cols-2 gap-4">
                <PlatformIcons platforms={gameA.parent_platforms} />
                <PlatformIcons platforms={gameB.parent_platforms} />
              </div>
            </div>

            {(gameA.pc_requirements || gameB.pc_requirements) && (
              <div className="p-4 rounded-xl bg-zinc-800/40 shadow-sm space-y-3 text-xs">
                <div className="text-[11px] uppercase font-bold tracking-wider text-zinc-400">
                  Минимальные системные требования
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-zinc-400 font-mono text-[11px] leading-relaxed whitespace-pre-line bg-zinc-900/60 p-3 rounded-lg">
                    {gameA.pc_requirements?.minimum
                      ? gameA.pc_requirements.minimum.replace(/<[^>]*>?/gm, ' ')
                      : 'Требования не указаны'}
                  </div>
                  <div className="text-zinc-400 font-mono text-[11px] leading-relaxed whitespace-pre-line bg-zinc-900/60 p-3 rounded-lg">
                    {gameB.pc_requirements?.minimum
                      ? gameB.pc_requirements.minimum.replace(/<[^>]*>?/gm, ' ')
                      : 'Требования не указаны'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3.5 bg-zinc-950/80 flex items-center justify-between shrink-0">
          <div className="text-xs text-zinc-400">
            Нажмите на карточку, чтобы открыть полный обзор
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onSelectGame?.(gameA);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Обзор {gameA.name}
            </button>
            <button
              type="button"
              onClick={() => {
                onSelectGame?.(gameB);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Обзор {gameB.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
