import type { EmbedConfig } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { getHostname } from './url';

export function EmbedModule({ instance }: ModuleDisplayProps<EmbedConfig, unknown>) {
  const { url, mode } = instance.config;

  if (!url) {
    return <p className="text-sm text-slate-400">No URL configured yet — edit this module to set one.</p>;
  }

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex justify-end text-xs text-slate-400">
        <a href={url} target="_blank" rel="noreferrer" className="shrink-0 text-sky-400 hover:underline">
          Open in new tab ↗
        </a>
      </div>
      {mode === 'iframe' ? (
        <iframe
          src={url}
          title={getHostname(url)}
          className="h-64 w-full flex-1 rounded border border-slate-800 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          referrerPolicy="no-referrer"
        />
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="flex h-64 flex-1 items-center justify-center rounded border border-dashed border-slate-700 text-slate-400 hover:border-sky-500 hover:text-sky-400"
        >
          Open {getHostname(url)} ↗
        </a>
      )}
    </div>
  );
}
