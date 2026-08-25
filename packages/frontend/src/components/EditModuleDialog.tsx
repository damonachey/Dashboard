import { useState } from 'react';
import type { ModuleInstance } from '@dashboard/shared';
import { useUpdateModuleInstance } from '../hooks/useTabs';
import { moduleRegistry } from '../modules/registry';

export function EditModuleDialog({ instance, onClose }: { instance: ModuleInstance; onClose: () => void }) {
  const updateInstance = useUpdateModuleInstance();
  const [config, setConfig] = useState<unknown>(instance.config);

  const uiDef = moduleRegistry[instance.moduleTypeId];
  const ConfigForm = uiDef?.ConfigForm;

  function handleSave(): void {
    updateInstance.mutate({ id: instance.id, config });
    onClose();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-semibold text-slate-200">Edit {uiDef ? instance.moduleTypeId : 'module'}</h2>

        {ConfigForm ? (
          <ConfigForm value={config} onChange={setConfig} />
        ) : (
          <p className="text-sm text-slate-400">This module type has no editable options.</p>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 text-sm text-slate-400 hover:text-slate-200">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-sky-600 px-3 py-1 text-sm text-white hover:bg-sky-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
