import React from 'react';
import { sounds } from '../../utils/soundEffects';

interface ScreenshotItem {
  id: number;
  image: string;
}

interface GameMediaGalleryProps {
  screenshots: ScreenshotItem[];
  onSelectImage: (img: string) => void;
}

export const GameMediaGallery: React.FC<GameMediaGalleryProps> = ({
  screenshots,
  onSelectImage,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {screenshots.map((s, idx) => (
          <div
            key={s.id || idx}
            onClick={() => {
              sounds.playSelect();
              onSelectImage(s.image);
            }}
            className="aspect-video rounded-xl overflow-hidden bg-zinc-950 cursor-pointer group relative shadow-md hover:shadow-xl transition-all"
          >
            <img
              src={s.image}
              alt={`Screenshot ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-xs text-white bg-black/70 px-3 py-1.5 rounded-lg backdrop-blur-sm font-medium">
                Увеличить фото
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
