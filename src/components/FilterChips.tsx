import React from 'react';

export interface FilterChipOption {
  id: string;
  label: string;
}

const CHIPS: FilterChipOption[] = [
  { id: 'all', label: 'Все игры' },
  { id: 'masterpiece', label: 'Топ Metacritic (90+)' },
  { id: 'short', label: 'Короткие (до 25 ч)' },
  { id: 'top_rated', label: 'Высокий рейтинг' },
];

interface Props {
  activeChip: string;
  onSelectChip: (chipId: string) => void;
}

export const FilterChips: React.FC<Props> = ({ activeChip, onSelectChip }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {CHIPS.map((chip) => {
        const isActive = activeChip === chip.id;
        return (
          <button
            key={chip.id}
            type="button"
            onClick={() => onSelectChip(chip.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors outline-none shadow-sm ${
              isActive
                ? 'bg-white text-zinc-950 font-bold shadow-md'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white'
            }`}
          >
            {chip.label}
          </button>
        );
      })}
    </div>
  );
};
