import React, { useState, useRef, useEffect } from 'react';
import { sounds } from '../utils/soundEffects';

export interface SortOption {
  value: string;
  label: string;
  shortLabel: string;
  sub: string;
}

const SORT_OPTIONS: SortOption[] = [
  {
    value: '',
    label: 'По умолчанию',
    shortLabel: 'По умолчанию',
    sub: 'Рекомендованный порядок',
  },
  {
    value: '-metacritic',
    label: 'Рейтинг Metacritic',
    shortLabel: 'Metacritic',
    sub: 'Сначала высший балл (90+)',
  },
  {
    value: '-rating',
    label: 'Оценка игроков',
    shortLabel: 'Рейтинг',
    sub: 'Сначала топ по RAWG',
  },
  {
    value: '-released',
    label: 'Дата выхода',
    shortLabel: 'Новинки',
    sub: 'Сначала свежие релизы',
  },
  {
    value: 'name',
    label: 'По алфавиту',
    shortLabel: 'А — Я',
    sub: 'Сортировка по названию',
  },
  {
    value: '-playtime',
    label: 'По длительности',
    shortLabel: 'Длительность',
    sub: 'Сначала масштабные (~ ч)',
  },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const SortDropdown: React.FC<Props> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeOption =
    SORT_OPTIONS.find((opt) => opt.value === (value || '')) || SORT_OPTIONS[0];

  const isCustomSort = Boolean(value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    sounds.playNav();
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (sortVal: string) => {
    sounds.playSelect();
    onChange(sortVal);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={toggleDropdown}
        className={`group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors duration-150 outline-none ${
          isOpen
            ? 'bg-zinc-800 text-white'
            : isCustomSort
            ? 'bg-zinc-800 text-white'
            : 'bg-white/[0.05] hover:bg-white/10 text-zinc-300 hover:text-white'
        }`}
        title="Сортировка каталога игр"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate max-w-[140px] sm:max-w-none tracking-tight">
          {activeOption.value ? `Сортировка: ${activeOption.shortLabel}` : activeOption.label}
        </span>

        <span
          className={`text-[9px] transition-transform duration-200 inline-block ${
            isOpen ? 'rotate-180 text-white' : 'text-zinc-500 group-hover:text-zinc-300'
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Сортировка каталога"
          className="absolute right-0 top-full mt-2 w-60 rounded-xl bg-zinc-950 p-1.5 shadow-2xl z-50 animate-fadeIn"
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
            <span>Сортировка</span>
            {isCustomSort && (
              <button
                type="button"
                onClick={() => handleSelect('')}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-normal transition-colors"
              >
                сбросить
              </button>
            )}
          </div>

          <div className="space-y-0.5">
            {SORT_OPTIONS.map((opt) => {
              const isSelected = (value || '') === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  onMouseEnter={() => sounds.playNav()}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors group ${
                    isSelected
                      ? 'bg-white text-zinc-950 font-bold'
                      : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold leading-tight truncate">
                      {opt.label}
                    </span>
                    <span
                      className={`text-[10px] leading-tight truncate ${
                        isSelected ? 'text-zinc-600 font-medium' : 'text-zinc-500'
                      }`}
                    >
                      {opt.sub}
                    </span>
                  </div>

                  {isSelected && (
                    <span className="text-xs font-bold shrink-0 text-zinc-950 ml-2">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
