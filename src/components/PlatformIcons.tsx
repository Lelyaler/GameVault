import React from 'react';
import type { Platform } from '../types/game';

interface Props {
  platforms: { platform: Platform }[];
}

export const PlatformIcons: React.FC<Props> = ({ platforms }) => {
  const getBadge = (slug: string) => {
    switch (slug) {
      case 'pc':
        return (
          <span className="text-xs font-bold text-zinc-300 bg-zinc-800/90 px-1.5 py-0.5 rounded shadow-sm" title="PC">
            PC
          </span>
        );
      case 'playstation':
        return (
          <span className="text-xs font-bold text-blue-400 bg-blue-950/70 px-1.5 py-0.5 rounded shadow-sm" title="PlayStation">
            PS
          </span>
        );
      case 'xbox':
        return (
          <span className="text-xs font-bold text-green-400 bg-green-950/70 px-1.5 py-0.5 rounded shadow-sm" title="Xbox">
            XB
          </span>
        );
      case 'nintendo':
        return (
          <span className="text-xs font-bold text-red-400 bg-red-950/70 px-1.5 py-0.5 rounded shadow-sm" title="Nintendo">
            NSW
          </span>
        );
      default:
        return (
          <span className="text-xs font-bold text-zinc-400 bg-zinc-800/60 px-1.5 py-0.5 rounded shadow-sm" title={slug}>
            {slug.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {platforms?.map(({ platform }) => (
        <span key={platform.id}>{getBadge(platform.slug)}</span>
      ))}
    </div>
  );
};
