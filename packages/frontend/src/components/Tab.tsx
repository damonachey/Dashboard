import { useState } from 'react';
import type { TabWithModules } from '@dashboard/shared';
import { ModuleCard } from './ModuleCard';
import { AddModuleDialog } from './AddModuleDialog';
import { useLocked } from '../context/LockContext';
import { useReorderModules } from '../hooks/useTabs';

export function Tab({
  tab,
  highlightedModuleId,
  highlightedItemId,
}: {
  tab: TabWithModules;
  highlightedModuleId?: string | null;
  highlightedItemId?: string | null;
}) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { locked } = useLocked();
  const reorderModules = useReorderModules();
  const [draggedId, setDraggedId] = useState<string | null>(null);

  function handleDrop(targetId: string): void {
    const sourceId = draggedId;
    setDraggedId(null);
    if (locked || !sourceId || sourceId === targetId) return;

    const order = tab.modules.map((m) => m.id);
    const fromIndex = order.indexOf(sourceId);
    const toIndex = order.indexOf(targetId);
    if (fromIndex === -1 || toIndex === -1) return;

    order.splice(fromIndex, 1);
    order.splice(toIndex, 0, sourceId);
    reorderModules.mutate(order);
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tab.modules.map((instance) => (
        <div
          key={instance.id}
          draggable={!locked}
          onDragStart={() => setDraggedId(instance.id)}
          onDragEnd={() => setDraggedId(null)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(instance.id)}
          className={`${draggedId === instance.id ? 'opacity-40' : ''} ${
            !locked ? 'cursor-grab active:cursor-grabbing' : ''
          }`}
        >
          <ModuleCard
            instance={instance}
            highlighted={instance.id === highlightedModuleId && !highlightedItemId}
            highlightedItemId={instance.id === highlightedModuleId ? (highlightedItemId ?? undefined) : undefined}
          />
        </div>
      ))}

      {!locked && (
        <button
          onClick={() => setShowAddDialog(true)}
          className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-slate-700 text-slate-500 hover:border-sky-500 hover:text-sky-400"
        >
          + Add module
        </button>
      )}

      {showAddDialog && <AddModuleDialog tabId={tab.id} onClose={() => setShowAddDialog(false)} />}
    </div>
  );
}
