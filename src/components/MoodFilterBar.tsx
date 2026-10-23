import React from 'react';
import { MOODS } from '../utils/moodFilters';
import { sounds } from '../utils/soundEffects';

interface Props {
  activeMood: string | null;
  onSelectMood: (moodId: string | null) => void;
}

export const MoodFilterBar: React.FC<Props> = ({ activeMood, onSelectMood }) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <button
        type="button"
        onClick={() => {
          sounds.playNav();
          onSelectMood(null);
        }}
        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
          !activeMood || activeMood === 'all'
            ? 'bg-white text-zinc-950 font-bold shadow-sm'
            : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
        }`}
      >
        <span>Любое настроение</span>
      </button>

      {MOODS.map((mood) => {
        const isActive = activeMood === mood.id;
        return (
          <button
            key={mood.id}
            type="button"
            title={mood.description}
            onClick={() => {
              sounds.playNav();
              onSelectMood(isActive ? null : mood.id);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              isActive
                ? 'bg-zinc-800 text-white font-bold shadow-sm'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300'
            }`}
          >
            <span>{mood.name}</span>
          </button>
        );
      })}
    </div>
  );
};
