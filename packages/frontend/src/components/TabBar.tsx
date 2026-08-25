import { useState } from 'react';
import type { TabWithModules } from '@dashboard/shared';
import { useCreateTab, useDeleteTab } from '../hooks/useTabs';

export function TabBar({
  tabs,
  activeTabId,
  onSelect,
}: {
  tabs: TabWithModules[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
}) {
  const createTab = useCreateTab();
  const deleteTab = useDeleteTab();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');

  function handleCreate(): void {
    if (!name.trim()) return;
    createTab.mutate(name.trim());
    setName('');
    setAdding(false);
  }

  function handleDelete(tab: TabWithModules): void {
    const moduleWarning =
      tab.modules.length > 0
        ? ` This will also remove its ${tab.modules.length} module${tab.modules.length === 1 ? '' : 's'}.`
        : '';
    if (window.confirm(`Delete tab "${tab.name}"?${moduleWarning}`)) {
      deleteTab.mutate(tab.id);
    }
  }

  return (
    <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-2">
      {tabs.map((tab) => (
        <div key={tab.id} className="group flex items-center">
          <button
            onClick={() => onSelect(tab.id)}
            className={`rounded-t px-3 py-1 text-sm ${
              tab.id === activeTabId ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.name}
          </button>
          {tabs.length > 1 && (
            <button
              onClick={() => handleDelete(tab)}
              className="hidden text-xs text-slate-600 hover:text-red-400 group-hover:inline"
              aria-label={`Delete ${tab.name}`}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {adding ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
            placeholder="Tab name"
          />
          <button onClick={handleCreate} className="text-sm text-sky-400 hover:underline">
            Add
          </button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="px-2 text-sm text-slate-500 hover:text-slate-200">
          + Tab
        </button>
      )}
    </div>
  );
}
