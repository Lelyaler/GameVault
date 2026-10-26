import React from 'react';
import type { Game } from '../../types/game';

interface GameSpecsTabProps {
  game: Game;
}

export const GameSpecsTab: React.FC<GameSpecsTabProps> = ({ game }) => {
  if (!game.pc_requirements || (!game.pc_requirements.minimum && !game.pc_requirements.recommended)) {
    return (
      <div className="p-8 text-center text-zinc-400 text-xs">
        Системные требования для данной игры не указаны.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
      {game.pc_requirements.minimum && (
        <div className="p-5 rounded-2xl bg-zinc-800/40 space-y-2.5 shadow-sm border border-white/5">
          <h4 className="font-bold text-zinc-200 text-sm">
            Минимальные требования
          </h4>
          <p className="text-zinc-400 leading-relaxed font-mono text-xs whitespace-pre-line">
            {game.pc_requirements.minimum.replace(/<[^>]*>?/gm, ' ')}
          </p>
        </div>
      )}

      {game.pc_requirements.recommended && (
        <div className="p-5 rounded-2xl bg-zinc-800/40 space-y-2.5 shadow-sm border border-white/5">
          <h4 className="font-bold text-emerald-300 text-sm">
            Рекомендуемые требования
          </h4>
          <p className="text-zinc-400 leading-relaxed font-mono text-xs whitespace-pre-line">
            {game.pc_requirements.recommended.replace(/<[^>]*>?/gm, ' ')}
          </p>
        </div>
      )}
    </div>
  );
};
