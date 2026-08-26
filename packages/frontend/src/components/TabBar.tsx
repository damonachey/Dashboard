import { useState } from 'react';
import type { SearchResult, TabWithModules } from '@dashboard/shared';
import { useCreateTab, useDeleteTab, useReorderTabs, useUpdateTab } from '../hooks/useTabs';
import { useLocked } from '../context/LockContext';
import { SearchBox } from './SearchBox';

export function TabBar({
  tabs,
  activeTabId,
  onSelect,
  onSelectSearchResult,
}: {
  tabs: TabWithModules[];
  activeTabId: string | null;
  onSelect: (id: string) => void;
  onSelectSearchResult: (result: SearchResult) => void;
}) {
  const createTab = useCreateTab();
  const deleteTab = useDeleteTab();
  const reorderTabs = useReorderTabs();
  const updateTab = useUpdateTab();
  const { locked } = useLocked();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  function startRename(tab: TabWithModules): void {
    if (locked) return;
    setEditingTabId(tab.id);
    setEditValue(tab.name);
  }

  function commitRename(): void {
    const tabId = editingTabId;
    setEditingTabId(null);
    if (!tabId) return;
    const trimmed = editValue.trim();
    const original = tabs.find((t) => t.id === tabId)?.name;
    if (trimmed && trimmed !== original) {
      updateTab.mutate({ id: tabId, name: trimmed });
    }
  }

  function tabHref(tab: TabWithModules): string {
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab.name);
    return `${window.location.pathname}?${params.toString()}`;
  }

  function handleTabClick(e: React.MouseEvent, tab: TabWithModules): void {
    // Let ctrl/cmd/shift-click fall through to the browser's native "open in
    // new tab/window" handling instead of hijacking it for in-page selection.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onSelect(tab.id);
  }

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

  function handleDrop(targetId: string): void {
    const sourceId = draggedId;
    setDraggedId(null);
    if (locked || !sourceId || sourceId === targetId) return;

    const order = tabs.map((t) => t.id);
    const fromIndex = order.indexOf(sourceId);
    const toIndex = order.indexOf(targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    order.splice(fromIndex, 1);
    order.splice(toIndex, 0, sourceId);
    reorderTabs.mutate(order);
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-2">
      <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`group flex items-center ${draggedId === tab.id ? 'opacity-40' : ''}`}
          draggable={!locked}
          onDragStart={() => setDraggedId(tab.id)}
          onDragEnd={() => setDraggedId(null)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(tab.id)}
        >
          {editingTabId === tab.id ? (
            <input
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                else if (e.key === 'Escape') setEditingTabId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-t border border-slate-700 bg-slate-900 px-3 py-1 text-sm text-slate-100"
            />
          ) : (
            <a
              href={tabHref(tab)}
              draggable={false}
              onClick={(e) => handleTabClick(e, tab)}
              onDoubleClick={() => startRename(tab)}
              title={!locked ? 'Double-click to rename · right-click to open in a new tab' : undefined}
              className={`rounded-t px-3 py-1 text-sm ${!locked ? 'cursor-grab active:cursor-grabbing' : ''} ${
                tab.id === activeTabId ? 'bg-slate-800 text-slate-100' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.name}
            </a>
          )}
          {!locked && tabs.length > 1 && (
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

      {!locked &&
        (adding ? (
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
        ))}
      </div>

      <SearchBox onSelectResult={onSelectSearchResult} />
    </div>
  );
}
