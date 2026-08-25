import { useState } from 'react';
import type { ModuleInstance } from '@dashboard/shared';
import { useModuleTypes } from '../hooks/useModuleTypes';
import { useModuleData } from '../hooks/useModuleData';
import { useDeleteModuleInstance } from '../hooks/useTabs';
import { moduleRegistry } from '../modules/registry';
import { EditModuleDialog } from './EditModuleDialog';

export function ModuleCard({ instance }: { instance: ModuleInstance }) {
  const { data: moduleTypes } = useModuleTypes();
  const meta = moduleTypes?.find((m) => m.id === instance.moduleTypeId);
  const isApiKind = meta?.kind === 'api';

  const { data: envelope, isLoading } = useModuleData(instance.id, isApiKind);
  const deleteInstance = useDeleteModuleInstance();
  const [showEditDialog, setShowEditDialog] = useState(false);

  const uiDef = moduleRegistry[instance.moduleTypeId];

  function handleRemove(): void {
    if (window.confirm(`Remove ${meta?.displayName ?? instance.moduleTypeId}?`)) {
      deleteInstance.mutate(instance.id);
    }
  }

  return (
    <div className="flex min-h-32 flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900/60 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">{meta?.displayName ?? instance.moduleTypeId}</h3>
        <div className="flex items-center gap-2">
          {uiDef?.ConfigForm && (
            <button
              onClick={() => setShowEditDialog(true)}
              className="text-slate-600 hover:text-slate-300"
              aria-label="Edit module"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z"
                />
              </svg>
            </button>
          )}
          <button
            onClick={handleRemove}
            className="text-xs text-slate-500 hover:text-red-400"
            aria-label="Remove module"
          >
            ✕
          </button>
        </div>
      </div>

      {showEditDialog && <EditModuleDialog instance={instance} onClose={() => setShowEditDialog(false)} />}

      {isApiKind && isLoading && <p className="text-sm text-slate-500">Loading…</p>}

      {isApiKind && envelope?.status === 'error' && (
        <div className="rounded border border-amber-900 bg-amber-950/40 px-2 py-1 text-xs text-amber-400">
          {envelope.lastErrorMessage}
        </div>
      )}

      {uiDef ? (
        <uiDef.Display instance={instance} envelope={envelope} />
      ) : (
        <p className="text-sm text-red-400">Unknown module type: {instance.moduleTypeId}</p>
      )}
    </div>
  );
}
