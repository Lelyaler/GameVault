import React, { useState } from 'react';
import type { Game, BacklogStatus } from '../types/game';
import type { BacklogEntry } from '../hooks/useBacklog';
import { X, Check } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  catalog: Game[];
  onImportEntries: (entries: BacklogEntry[]) => void;
}

interface PresetProfile {
  id: string;
  name: string;
  description: string;
  games: { slug: string; status: BacklogStatus; rating: number; note?: string }[];
}

const PRESET_PROFILES: PresetProfile[] = [
  {
    id: 'rpg_narrative',
    name: 'RPG & Сюжетные хиты',
    description: 'Масштабные сюжетные проекты и ролевые игры',
    games: [
      { slug: 'the-witcher-3-wild-hunt', status: 'completed', rating: 5, note: 'Основная игра и дополнения' },
      { slug: 'cyberpunk-2077', status: 'playing', rating: 5, note: 'Phantom Liberty' },
      { slug: 'elden-ring', status: 'completed', rating: 5, note: 'Пройдено' },
      { slug: 'baldurs-gate-3', status: 'playing', rating: 5, note: 'Акт 3' },
    ],
  },
  {
    id: 'indie_favorites',
    name: 'Инди-коллекция',
    description: 'Атмосферные авторские проекты и головоломки',
    games: [
      { slug: 'outer-wilds', status: 'completed', rating: 5, note: 'Пройдено' },
      { slug: 'hades', status: 'completed', rating: 5, note: 'Пройдено' },
      { slug: 'hollow-knight', status: 'playing', rating: 5, note: 'В процессе' },
      { slug: 'signalis', status: 'completed', rating: 5, note: 'Пройдено' },
    ],
  },
  {
    id: 'action_adventures',
    name: 'Экшен и приключения',
    description: 'Динамичные блокбастеры от третьего лица',
    games: [
      { slug: 'red-dead-redemption-2', status: 'completed', rating: 5, note: 'Пройдено' },
      { slug: 'god-of-war', status: 'completed', rating: 5, note: 'Пройдено' },
      { slug: 'bloodborne', status: 'completed', rating: 5, note: 'Пройдено' },
      { slug: 'grand-theft-auto-v', status: 'backlog', rating: 4, note: 'В планах' },
    ],
  },
];

export const SteamImportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  catalog,
  onImportEntries,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'paste'>('presets');
  const [pasteData, setPasteData] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<string>('rpg_narrative');
  const [importSuccess, setImportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    sounds.playBack();
    onClose();
  };

  const handleApplyPreset = (preset: PresetProfile) => {
    sounds.playSelect();
    const newEntries: BacklogEntry[] = [];

    preset.games.forEach((item) => {
      const matched = catalog.find(
        (g) => g.slug.includes(item.slug) || item.slug.includes(g.slug)
      );
      if (matched) {
        newEntries.push({
          game: matched,
          status: item.status,
          userRating: item.rating,
          userNote: item.note,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    if (newEntries.length > 0) {
      onImportEntries(newEntries);
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 700);
    }
  };

  const handleImportPresetClick = () => {
    const matchedPreset = PRESET_PROFILES.find((p) => p.id === selectedPreset) || PRESET_PROFILES[0];
    handleApplyPreset(matchedPreset);
  };

  const handleImportPaste = () => {
    sounds.playSelect();
    if (!pasteData.trim()) return;

    const newEntries: BacklogEntry[] = [];
    const lines = pasteData.split('\n');

    lines.forEach((line) => {
      const cleanLine = line.trim().toLowerCase();
      if (!cleanLine) return;

      const matched = catalog.find((g) =>
        cleanLine.includes(g.name.toLowerCase()) || cleanLine.includes(g.slug)
      );

      if (matched && !newEntries.some((e) => e.game.id === matched.id)) {
        let status: BacklogStatus = 'backlog';
        if (cleanLine.includes('играю') || cleanLine.includes('playing')) status = 'playing';
        if (cleanLine.includes('пройдено') || cleanLine.includes('completed') || cleanLine.includes('done')) status = 'completed';

        newEntries.push({
          game: matched,
          status,
          updatedAt: new Date().toISOString(),
        });
      }
    });

    if (newEntries.length > 0) {
      onImportEntries(newEntries);
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="relative w-full max-w-lg bg-zinc-900 rounded-2xl shadow-2xl shadow-black z-10 p-5 sm:p-6 space-y-5 text-left">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Импорт и готовые коллекции
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Быстрое наполнение бэклога готовыми подборками или распознавание из текста
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

        <div className="flex items-center gap-2 p-1 bg-zinc-950/60 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'presets'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Готовые подборки
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'paste'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Список текстом
          </button>
        </div>

        {activeTab === 'presets' && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2">
                Выберите тематическую подборку:
              </label>
              <div className="space-y-2">
                {PRESET_PROFILES.map((preset) => {
                  const isSelected = selectedPreset === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`p-3 rounded-xl cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white/15 shadow-md font-semibold'
                          : 'bg-zinc-800/40 hover:bg-zinc-800/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{preset.name}</span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          {preset.games.length} игры
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                        {preset.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleImportPresetClick}
              disabled={importSuccess}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                importSuccess
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-md active:scale-98'
              }`}
            >
              {importSuccess ? (
                <span className="inline-flex items-center gap-1.5 justify-center">
                  <Check className="w-4 h-4" /> Игры добавлены в библиотеку!
                </span>
              ) : (
                'Загрузить выбранную подборку'
              )}
            </button>
          </div>
        )}

        {activeTab === 'paste' && (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                Вставьте список игр (названия игр из заметок или текстового файла)
              </label>
              <textarea
                value={pasteData}
                onChange={(e) => setPasteData(e.target.value)}
                placeholder={'The Witcher 3: Wild Hunt - Пройдено\nCyberpunk 2077 - Играю\nOuter Wilds\nHades'}
                rows={5}
                className="w-full bg-zinc-800/80 hover:bg-zinc-800 focus:bg-zinc-950 text-xs font-mono text-zinc-200 placeholder-zinc-500 rounded-lg p-2.5 outline-none transition-all resize-none leading-relaxed"
              />
            </div>

            <button
              type="button"
              onClick={handleImportPaste}
              disabled={!pasteData.trim() || importSuccess}
              className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                importSuccess
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-md disabled:opacity-40 disabled:pointer-events-none'
              }`}
            >
              {importSuccess ? 'Игры добавлены!' : 'Распознать и добавить в библиотеку'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
