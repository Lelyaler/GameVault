import React, { useState } from 'react';
import { X, ExternalLink, Check } from 'lucide-react';
import { getApiKey, setApiKey } from '../services/api-client';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onKeySaved: () => void;
}

export const ApiKeyModal: React.FC<Props> = ({ isOpen, onClose, onKeySaved }) => {
  const [currentKey, setCurrentKey] = useState(getApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(currentKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onKeySaved();
      onClose();
    }, 400);
  };

  const handleClear = () => {
    setCurrentKey('');
    setApiKey('');
    onKeySaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-zinc-900 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black z-10 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Ключ RAWG API</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Для подключения поиска по всей базе (500,000+ игр) укажите ключ. Без ключа работает встроенная демо-коллекция.
        </p>

        <a
          href="https://rawg.io/apidocs"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs text-zinc-200 hover:text-white underline"
        >
          <span>Получить ключ на rawg.io</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <div>
          <input
            type="text"
            value={currentKey}
            onChange={(e) => setCurrentKey(e.target.value)}
            placeholder="Вставьте API-ключ..."
            className="w-full bg-zinc-950 focus:bg-zinc-900 rounded-lg px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 outline-none shadow-inner transition-colors"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          {getApiKey() ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-rose-400 hover:text-rose-300"
            >
              Сбросить ключ
            </button>
          ) : (
            <span className="text-[11px] text-zinc-500">Демо-каталог активен</span>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 transition-colors"
            >
              {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{savedSuccess ? 'Готово' : 'Сохранить'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
