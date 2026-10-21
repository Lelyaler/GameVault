import React from 'react';

interface Props {
  score: number | null;
}

export const CriticScore: React.FC<Props> = ({ score }) => {
  if (score === null || score === undefined) return null;

  const getStyle = (s: number) => {
    if (s >= 90) return 'text-emerald-300 bg-emerald-500/25';
    if (s >= 75) return 'text-emerald-400 bg-emerald-950/60';
    if (s >= 60) return 'text-amber-400 bg-amber-950/60';
    return 'text-rose-400 bg-rose-950/60';
  };

  return (
    <span
      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md tracking-tight shadow-sm ${getStyle(score)}`}
      title={`Metacritic: ${score}/100`}
    >
      {score}
    </span>
  );
};
