import React from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface Props {
  message: string | null;
  type?: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<Props> = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 text-white shadow-2xl shadow-black/80 animate-fadeIn text-xs sm:text-sm font-medium">
      {type === 'success' ? (
        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
      )}
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 text-zinc-500 hover:text-white p-0.5 rounded"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
