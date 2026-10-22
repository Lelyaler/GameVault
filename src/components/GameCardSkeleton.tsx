import React from 'react';

export const GameCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="aspect-[16/10] w-full rounded-xl bg-zinc-900" />

      <div className="pt-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="h-3.5 w-16 bg-zinc-900 rounded" />
          <div className="h-4 w-6 bg-zinc-900 rounded" />
        </div>
        <div className="h-4 w-3/4 bg-zinc-900 rounded" />
        <div className="h-3 w-1/3 bg-zinc-900/60 rounded" />
      </div>
    </div>
  );
};
