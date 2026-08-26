import type { EmbedConfig, EmbedScreenshotData } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { getHostname } from './url';

export function EmbedModule({
  instance,
  envelope,
}: ModuleDisplayProps<EmbedConfig, EmbedScreenshotData | null>) {
  const { url, mode } = instance.config;

  if (!url) {
    return <p className="text-sm text-slate-400">No URL configured yet — edit this module to set one.</p>;
  }

  if (mode === 'iframe') {
    return (
      <iframe
        src={url}
        title={getHostname(url)}
        className="h-64 w-full flex-1 rounded border border-slate-800 bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        referrerPolicy="no-referrer"
      />
    );
  }

  if (mode === 'screenshot') {
    const screenshotDataUrl = envelope?.data?.screenshotDataUrl;
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block flex-1 overflow-hidden rounded border border-slate-800">
        {screenshotDataUrl ? (
          <img src={screenshotDataUrl} alt={getHostname(url)} className="w-full" />
        ) : (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            {envelope?.status === 'error' ? 'Screenshot failed — see error above' : 'Loading screenshot…'}
          </div>
        )}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex h-64 flex-1 items-center justify-center rounded border border-dashed border-slate-700 text-slate-400 hover:border-sky-500 hover:text-sky-400"
    >
      Open {getHostname(url)} ↗
    </a>
  );
}
