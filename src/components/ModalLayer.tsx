import React, { Suspense, lazy } from 'react';
import type { Game, BacklogStatus } from '../types/game';
import type { BacklogEntry } from '../hooks/useBacklog';

const GameDetailsModal = lazy(() =>
  import('./GameDetailsModal').then((m) => ({ default: m.GameDetailsModal }))
);
const ApiKeyModal = lazy(() =>
  import('./ApiKeyModal').then((m) => ({ default: m.ApiKeyModal }))
);
const GameCompareModal = lazy(() =>
  import('./GameCompareModal').then((m) => ({ default: m.GameCompareModal }))
);
const SteamImportModal = lazy(() =>
  import('./SteamImportModal').then((m) => ({ default: m.SteamImportModal }))
);

export type ActiveModalType = 'steam' | 'settings' | null;

interface ModalLayerProps {
  activeModal: ActiveModalType;
  onCloseModal: () => void;
  selectedGame: Game | null;
  onCloseSelectedGame: () => void;
  onSelectGame: (game: Game) => void;
  compareGame: Game | null;
  onCloseCompareGame: () => void;
  onOpenCompare: (game: Game) => void;
  catalog: Game[];
  getStatus: (gameId: number) => BacklogStatus | null;
  getRating: (gameId: number) => number;
  getNote: (gameId: number) => string;
  updateStatus: (game: Game, status: BacklogStatus | null) => void;
  updateRating: (gameId: number, rating: number) => void;
  updateNote: (gameId: number, note: string) => void;
  onImportSteamEntries: (entries: BacklogEntry[]) => void;
  onApiKeySaved: () => void;
}

export const ModalLayer: React.FC<ModalLayerProps> = ({
  activeModal,
  onCloseModal,
  selectedGame,
  onCloseSelectedGame,
  onSelectGame,
  compareGame,
  onCloseCompareGame,
  onOpenCompare,
  catalog,
  getStatus,
  getRating,
  getNote,
  updateStatus,
  updateRating,
  updateNote,
  onImportSteamEntries,
  onApiKeySaved,
}) => {
  return (
    <Suspense fallback={null}>
      {selectedGame && (
        <GameDetailsModal
          isOpen={true}
          onClose={onCloseSelectedGame}
          game={selectedGame}
          userStatus={getStatus(selectedGame.id)}
          userRating={getRating(selectedGame.id)}
          userNote={getNote(selectedGame.id)}
          onUpdateStatus={updateStatus}
          onUpdateRating={updateRating}
          onUpdateNote={updateNote}
          onOpenCompare={onOpenCompare}
        />
      )}

      {compareGame && (
        <GameCompareModal
          isOpen={true}
          onClose={onCloseCompareGame}
          gameA={compareGame}
          catalog={catalog}
          onSelectGame={onSelectGame}
          getStatus={getStatus}
          onUpdateStatus={updateStatus}
        />
      )}

      {activeModal === 'steam' && (
        <SteamImportModal
          isOpen={true}
          onClose={onCloseModal}
          catalog={catalog}
          onImportEntries={onImportSteamEntries}
        />
      )}

      {activeModal === 'settings' && (
        <ApiKeyModal
          isOpen={true}
          onClose={onCloseModal}
          onKeySaved={onApiKeySaved}
        />
      )}
    </Suspense>
  );
};
