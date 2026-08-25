import { useState } from 'react';
import { useModuleTypes } from '../hooks/useModuleTypes';
import { useAddModuleInstance } from '../hooks/useTabs';
import { moduleRegistry } from '../modules/registry';

export function AddModuleDialog({ tabId, onClose }: { tabId: string; onClose: () => void }) {
  const { data: moduleTypes } = useModuleTypes();
  const addModule = useAddModuleInstance();
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [config, setConfig] = useState<unknown>(undefined);

  const uiDef = selectedTypeId ? moduleRegistry[selectedTypeId] : undefined;

  function handleSelect(id: string): void {
    setSelectedTypeId(id);
    setConfig(moduleRegistry[id]?.defaultConfig ?? {});
  }

  function handleAdd(): void {
    if (!selectedTypeId) return;
    addModule.mutate({ tabId, moduleTypeId: selectedTypeId, config });
    onClose();
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="flex w-full max-w-md flex-col gap-4 rounded-lg border border-slate-800 bg-slate-900 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-sm font-semibold text-slate-200">Add module</h2>

        <select
          value={selectedTypeId ?? ''}
          onChange={(e) => handleSelect(e.target.value)}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
        >
          <option value="" disabled>
            Choose a module type…
          </option>
          {moduleTypes?.map((mt) => (
            <option key={mt.id} value={mt.id}>
              {mt.displayName}
            </option>
          ))}
        </select>

        {uiDef?.ConfigForm && config !== undefined && <uiDef.ConfigForm value={config} onChange={setConfig} />}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 text-sm text-slate-400 hover:text-slate-200">
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!selectedTypeId}
            className="rounded bg-sky-600 px-3 py-1 text-sm text-white hover:bg-sky-500 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
