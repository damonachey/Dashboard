import { useEffect, useRef, useState } from 'react';
import type { ModuleInstance } from '@dashboard/shared';
import { useModuleTypes } from '../hooks/useModuleTypes';
import { useModuleData } from '../hooks/useModuleData';
import { useDeleteModuleInstance } from '../hooks/useTabs';
import { moduleRegistry } from '../modules/registry';
import { EditModuleDialog } from './EditModuleDialog';
import { PencilIcon } from './icons';
import { useLocked } from '../context/LockContext';

export function ModuleCard({
  instance,
  highlighted = false,
  highlightedItemId,
}: {
  instance: ModuleInstance;
  highlighted?: boolean;
  highlightedItemId?: string;
}) {
  const { data: moduleTypes } = useModuleTypes();
  const meta = moduleTypes?.find((m) => m.id === instance.moduleTypeId);
  const isApiKind = meta?.kind === 'api';

  const { data: envelope, isLoading } = useModuleData(instance.id, isApiKind);
  const deleteInstance = useDeleteModuleInstance();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { locked } = useLocked();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (highlighted) {
      cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlighted]);

  const uiDef = moduleRegistry[instance.moduleTypeId];
  const title = uiDef?.getTitle?.(instance) ?? meta?.displayName ?? instance.moduleTypeId;
  const titleIcon = uiDef?.getTitleIcon?.(instance);
  const titleSuffix = uiDef?.getTitleSuffix?.(instance);
  const sourceUrl = uiDef?.getSourceUrl?.(instance, envelope);

  function handleRemove(): void {
    if (window.confirm(`Remove ${title}?`)) {
      deleteInstance.mutate(instance.id);
    }
  }

  return (
    <div
      ref={cardRef}
      className={`flex min-h-32 flex-col gap-2 rounded-lg border bg-slate-900/60 p-3 transition-shadow ${
        highlighted ? 'border-sky-500 ring-2 ring-sky-500' : 'border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="flex min-w-0 items-center gap-1.5 text-sm font-semibold text-slate-200">
          {titleIcon && (
            <img
              src={titleIcon}
              alt=""
              className="h-4 w-4 shrink-0 rounded-sm"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          <span className="truncate">{title}</span>
          {titleSuffix && (
            <span className="shrink-0 font-mono text-xs font-normal text-slate-500">{titleSuffix}</span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-slate-600 hover:text-slate-300"
              aria-label="Open source in new tab"
              title="Open in new tab"
            >
              ↗
            </a>
          )}
          {!locked && uiDef?.ConfigForm && (
            <button
              onClick={() => setShowEditDialog(true)}
              className="text-slate-600 hover:text-slate-300"
              aria-label="Edit module"
            >
              <PencilIcon />
            </button>
          )}
          {!locked && (
            <button
              onClick={handleRemove}
              className="text-xs text-slate-500 hover:text-red-400"
              aria-label="Remove module"
            >
              ✕
            </button>
          )}
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
        <uiDef.Display instance={instance} envelope={envelope} highlightedItemId={highlightedItemId} />
      ) : (
        <p className="text-sm text-red-400">Unknown module type: {instance.moduleTypeId}</p>
      )}
    </div>
  );
}
