import { useState } from 'react';
import type { TabWithModules } from '@dashboard/shared';
import { ModuleCard } from './ModuleCard';
import { AddModuleDialog } from './AddModuleDialog';
import { useLocked } from '../context/LockContext';

export function Tab({ tab }: { tab: TabWithModules }) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { locked } = useLocked();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {tab.modules.map((instance) => (
        <ModuleCard key={instance.id} instance={instance} />
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
