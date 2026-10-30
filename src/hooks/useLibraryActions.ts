import { useCallback } from 'react';
import type { BacklogEntry } from './useBacklog';

interface LibraryActionsOptions {
  entries: BacklogEntry[];
  totalStatsCount: number;
  playingCount: number;
  completedCount: number;
  importEntries: (entries: BacklogEntry[]) => number;
  showToast: (message: string) => void;
}

export function useLibraryActions({
  entries,
  totalStatsCount,
  playingCount,
  completedCount,
  importEntries,
  showToast,
}: LibraryActionsOptions) {
  const handleShareLibrary = useCallback(() => {
    const currentUrl = window.location.origin + window.location.pathname + '#library';
    const payload = {
      title: 'GameVault Library',
      text: `Моя игровая коллекция в GameVault: ${totalStatsCount} игр (${playingCount} играю, ${completedCount} пройдено).`,
      url: currentUrl,
    };

    if (navigator.share) {
      navigator.share(payload).catch(() => {
        navigator.clipboard.writeText(currentUrl).then(() => {
          showToast('Ссылка на библиотеку скопирована в буфер обмена!');
        });
      });
    } else {
      navigator.clipboard.writeText(currentUrl).then(() => {
        showToast('Ссылка на библиотеку скопирована в буфер обмена!');
      });
    }
  }, [totalStatsCount, playingCount, completedCount, showToast]);

  const handleExportJson = useCallback(() => {
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gamevault-backlog-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Файл бэклога успешно экспортирован!');
  }, [entries, showToast]);

  const handleImportJson = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsed = JSON.parse(text);
          const count = importEntries(parsed);
          if (count > 0) {
            showToast(`Успешно импортировано ${count} игр в библиотеку!`);
          } else {
            showToast('Файл не содержит корректных записей бэклога.');
          }
        } catch {
          showToast('Ошибка при чтении JSON файла.');
        }
      };
      reader.readAsText(file);
    },
    [importEntries, showToast]
  );

  const handleImportSteamEntries = useCallback(
    (newEntries: BacklogEntry[]) => {
      const existingIds = new Set(newEntries.map((e) => e.game.id));
      const filteredExisting = entries.filter((e) => !existingIds.has(e.game.id));
      importEntries([...filteredExisting, ...newEntries]);
      showToast(`Импортировано игр: ${newEntries.length}!`);
    },
    [entries, importEntries, showToast]
  );

  return {
    handleShareLibrary,
    handleExportJson,
    handleImportJson,
    handleImportSteamEntries,
  };
}
