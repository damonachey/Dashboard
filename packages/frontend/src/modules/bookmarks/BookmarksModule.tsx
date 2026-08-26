import type { BookmarksConfig } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { getHostname, getFaviconUrl } from '../embed/url';

export function BookmarksModule({ instance }: ModuleDisplayProps<BookmarksConfig, unknown>) {
  const links = instance.config?.links ?? [];

  if (links.length === 0) {
    return <p className="text-sm text-slate-400">No bookmarks yet — edit this module to add some.</p>;
  }

  return (
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
  );
}
