import React from 'react';
import type { BacklogStatus } from '../types/game';
import { Share2, Download, Upload } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface Props {
  stats: {
    total: number;
    playing: number;
    backlog: number;
    completed: number;
    totalPlaytime: number;
  };
  activeTab: BacklogStatus | 'all';
  onSelectTab: (tab: BacklogStatus | 'all') => void;
  onShareLibrary?: () => void;
  onExportJson?: () => void;
  onImportJson?: (file: File) => void;
  onOpenSteamImport?: () => void;
}

export const LibraryDashboard: React.FC<Props> = ({
  stats,
  activeTab,
  onSelectTab,
  onShareLibrary,
  onExportJson,
  onImportJson,
  onOpenSteamImport,
}) => {
  return (
    <div className="space-y-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Моя библиотека
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Ваш персональный игровой трекер и бэклог
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              sounds.playSelect();
              onOpenSteamImport?.();
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white text-white hover:text-zinc-950 transition-all shadow-sm"
          >
            <span>Быстрый импорт</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playSelect();
              onShareLibrary?.();
            }}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors shadow-sm"
            title="Скопировать ссылку на библиотеку"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Поделиться</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playSelect();
              onExportJson?.();
            }}
            disabled={stats.total === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors disabled:opacity-40 shadow-sm"
            title="Скачать список в формате JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Экспорт JSON</span>
          </button>

          <label
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white transition-colors cursor-pointer shadow-sm"
            title="Импортировать список из JSON файла"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Импорт</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  sounds.playSelect();
                  onImportJson?.(file);
                  e.target.value = '';
                }
              }}
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-zinc-900/70 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-medium text-zinc-400">Всего игр</div>
          <div className="text-xl sm:text-2xl font-black text-white mt-0.5">{stats.total}</div>
        </div>

        <div className="bg-zinc-900/70 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-medium text-emerald-400/80">Играю сейчас</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">{stats.playing}</div>
        </div>

        <div className="bg-zinc-900/70 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-medium text-blue-400/80">Пройдено</div>
          <div className="text-xl sm:text-2xl font-black text-blue-300 mt-0.5">{stats.completed}</div>
        </div>

        <div className="bg-zinc-900/70 rounded-xl p-3.5 shadow-sm">
          <div className="text-[11px] font-medium text-purple-400/80">Время в играх</div>
          <div className="text-xl sm:text-2xl font-black text-purple-300 mt-0.5">~{stats.totalPlaytime} ч</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
        <button
          type="button"
          onClick={() => {
            sounds.playNav();
            onSelectTab('all');
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'all'
              ? 'bg-white text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
          }`}
        >
          Все ({stats.total})
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playNav();
            onSelectTab('playing');
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'playing'
              ? 'bg-emerald-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-emerald-300 hover:bg-white/[0.04]'
          }`}
        >
          Играю ({stats.playing})
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playNav();
            onSelectTab('backlog');
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'backlog'
              ? 'bg-amber-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-amber-300 hover:bg-white/[0.04]'
          }`}
        >
          В планах ({stats.backlog})
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playNav();
            onSelectTab('completed');
          }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'completed'
              ? 'bg-blue-500 text-zinc-950 shadow-sm'
              : 'text-zinc-400 hover:text-blue-300 hover:bg-white/[0.04]'
          }`}
        >
          Пройдено ({stats.completed})
        </button>
      </div>
    </div>
  );
};
