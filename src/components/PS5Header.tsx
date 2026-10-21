import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Gamepad2, Settings } from 'lucide-react';

interface Props {
  activeTab: 'catalog' | 'library';
  onSelectTab: (tab: 'catalog' | 'library') => void;
  searchText: string;
  onSearch: (text: string) => void;
  onOpenSettings: () => void;
  libraryCount: number;
  isGamepadConnected?: boolean;
  gamepadName?: string;
}

export const PS5Header: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  searchText,
  onSearch,
  onOpenSettings,
  libraryCount,
  isGamepadConnected = false,
  gamepadName = '',
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement !== searchInputRef.current &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-30 px-3 sm:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-2 sm:gap-4 backdrop-blur-xl bg-[#050608]/85 border-b border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="flex items-center gap-2 sm:gap-6">
        <div
          onClick={() => onSelectTab('catalog')}
          className="flex items-center gap-2.5 cursor-pointer group shrink-0"
        >
          <svg
            className="w-7 h-7 sm:w-8 sm:h-8 text-white transition-transform duration-200 group-hover:scale-105"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.5 4h-11C3.5 4 1 6.5 1 10.5c0 3.2 2 5.5 4.5 5.5.9 0 1.8-.3 2.5-.9l1.5-1.2c.4-.3.9-.4 1.5-.4h1c.6 0 1.1.1 1.5.4l1.5 1.2c.7.6 1.6.9 2.5.9 2.5 0 4.5-2.3 4.5-5.5C23 6.5 20.5 4 17.5 4zM6.5 11.5H5.8V10.2H4.5V9h1.3V7.8h1.2V9h1.3v1.2H7V11.5h-.5zm11.5-1.5c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm-1.5 2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm0-4c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm3 2c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z" />
          </svg>
          <div className="flex flex-col justify-center">
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white leading-none group-hover:text-zinc-200 transition-colors">
              GameVault
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-400 font-semibold leading-none mt-2 hidden sm:block">
              PS5 Experience
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('catalog')}
            className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'catalog'
                ? 'bg-white text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            Игры
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('library')}
            className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'library'
                ? 'bg-white text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <span>Библиотека</span>
            {libraryCount > 0 && (
              <span className={`text-[10px] sm:text-[11px] px-1.5 py-0.2 rounded-md font-bold ${
                activeTab === 'library' ? 'bg-zinc-900 text-white' : 'bg-zinc-800 text-zinc-300'
              }`}>
                {libraryCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {isGamepadConnected && (
          <div
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 text-emerald-300 text-xs font-medium tracking-tight shadow-sm"
            title={`Контроллер активен: ${gamepadName || 'Геймпад'}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Gamepad2 className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{gamepadName || 'Контроллер'}</span>
          </div>
        )}

        <div className="relative flex items-center">
          <Search className="absolute left-2.5 sm:left-3 w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchText}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Поиск игр (/)..."
            className="w-32 focus:w-44 sm:w-64 sm:focus:w-72 bg-zinc-900/90 hover:bg-zinc-800/90 focus:bg-zinc-900 text-xs sm:text-sm text-white placeholder-zinc-400 rounded-xl pl-8 sm:pl-9 pr-7 sm:pr-8 py-1.5 shadow-inner transition-all duration-200 outline-none border border-transparent focus:border-white/20"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => onSearch('')}
              className="absolute right-2 sm:right-2.5 text-zinc-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {time && (
          <div className="hidden sm:block text-xs font-mono font-semibold text-zinc-400 px-2.5 py-1">
            {time}
          </div>
        )}

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Настройки API"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
