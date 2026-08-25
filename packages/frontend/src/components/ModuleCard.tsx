import type { ModuleInstance } from '@dashboard/shared';
import { useModuleTypes } from '../hooks/useModuleTypes';
import { useModuleData } from '../hooks/useModuleData';
import { useDeleteModuleInstance } from '../hooks/useTabs';
import { moduleRegistry } from '../modules/registry';

export function ModuleCard({ instance }: { instance: ModuleInstance }) {
  const { data: moduleTypes } = useModuleTypes();
  const meta = moduleTypes?.find((m) => m.id === instance.moduleTypeId);
  const isApiKind = meta?.kind === 'api';

  const { data: envelope, isLoading } = useModuleData(instance.id, isApiKind);
  const deleteInstance = useDeleteModuleInstance();

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
        <button
          onClick={handleRemove}
          className="text-xs text-slate-500 hover:text-red-400"
          aria-label="Remove module"
        >
          ✕
        </button>
      </div>

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
