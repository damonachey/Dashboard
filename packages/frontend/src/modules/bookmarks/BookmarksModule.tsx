import { useState, type DragEvent } from 'react';
import type { BookmarksConfig } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { getHostname, getFaviconUrl } from '../embed/url';
import { useUpdateModuleInstance } from '../../hooks/useTabs';

// Dragging a link sets 'text/uri-list' (and/or 'text/plain') to the URL, and browsers that
// drag the anchor itself (not just its href) also set 'text/html' to the anchor's markup —
// pull a title out of that when present so the dropped bookmark isn't just a bare hostname.
function extractDroppedUrl(dataTransfer: DataTransfer): string | null {
  const raw = dataTransfer.getData('text/uri-list') || dataTransfer.getData('text/plain');
  const firstLine = raw.split('\n').find((line) => line.trim() && !line.startsWith('#'));
  if (!firstLine) return null;
  try {
    return new URL(firstLine.trim()).toString();
  } catch {
    return null;
  }
}

function extractDroppedTitle(dataTransfer: DataTransfer): string | undefined {
  const html = dataTransfer.getData('text/html');
  const text = /<a[^>]*>([^<]*)<\/a>/i.exec(html)?.[1]?.trim();
  return text || undefined;
}

export function BookmarksModule({ instance }: ModuleDisplayProps<BookmarksConfig, unknown>) {
  const links = instance.config?.links ?? [];
  const updateInstance = useUpdateModuleInstance();
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(e: DragEvent<HTMLDivElement>): void {
    if (!e.dataTransfer.types.includes('text/uri-list') && !e.dataTransfer.types.includes('text/plain')) return;
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>): void {
    e.preventDefault();
    setIsDragOver(false);

    const url = extractDroppedUrl(e.dataTransfer);
    if (!url || links.some((link) => link.url === url)) return;

    const title = extractDroppedTitle(e.dataTransfer);
    updateInstance.mutate({
      id: instance.id,
      config: { ...instance.config, links: [...links, { id: crypto.randomUUID(), url, title }] },
    });
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`flex flex-1 flex-col gap-2 rounded ${isDragOver ? 'outline outline-2 outline-dashed outline-sky-500' : ''}`}
    >
      {links.length === 0 ? (
        <p className="text-sm text-slate-400">
          {isDragOver ? 'Drop to add bookmark' : 'No bookmarks yet — edit this module to add some, or drag a link here.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-2 overflow-y-auto">
          {links
            .filter((link) => link.url)
            .map((link) => (
              <li key={link.id}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-200 hover:text-sky-400"
                >
                  <img
                    src={getFaviconUrl(link.url)}
                    alt=""
                    className="h-4 w-4 shrink-0 rounded-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span className="truncate">{link.title?.trim() || getHostname(link.url)}</span>
                </a>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
