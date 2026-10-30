import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  isModalOpen: boolean;
  effectiveViewMode: 'console' | 'grid';
  hasActiveGame: boolean;
  onNavigateLeft: () => void;
  onNavigateRight: () => void;
  onSelectGame: () => void;
  onCloseModal: () => void;
}

export function useKeyboardShortcuts({
  isModalOpen,
  effectiveViewMode,
  hasActiveGame,
  onNavigateLeft,
  onNavigateRight,
  onSelectGame,
  onCloseModal,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeElementTag = document.activeElement?.tagName;
      if (activeElementTag === 'INPUT' || activeElementTag === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Escape') {
        onCloseModal();
        return;
      }

      if (effectiveViewMode === 'console' && !isModalOpen) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          onNavigateLeft();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          onNavigateRight();
        } else if (e.key === 'Enter' && hasActiveGame) {
          e.preventDefault();
          onSelectGame();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    isModalOpen,
    effectiveViewMode,
    hasActiveGame,
    onNavigateLeft,
    onNavigateRight,
    onSelectGame,
    onCloseModal,
  ]);
}
