import type { BookmarkLink, BookmarksConfig } from '@dashboard/shared';
import type { ModuleConfigFormProps } from '../registry';

function newLink(): BookmarkLink {
  return { id: crypto.randomUUID(), url: '' };
}

export function BookmarksConfigForm({ value, onChange }: ModuleConfigFormProps<BookmarksConfig>) {
  function updateLink(id: string, patch: Partial<BookmarkLink>): void {
    onChange({ ...value, links: value.links.map((link) => (link.id === id ? { ...link, ...patch } : link)) });
  }

  function removeLink(id: string): void {
    onChange({ ...value, links: value.links.filter((link) => link.id !== id) });
  }

  function moveLink(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= value.links.length) return;
    const links = [...value.links];
    [links[index], links[target]] = [links[target], links[index]];
    onChange({ ...value, links });
  }

  function addLink(): void {
    onChange({ ...value, links: [...value.links, newLink()] });
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          type="text"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Bookmarks"
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1"
        />
      </label>

      <div className="flex flex-col gap-2">
        {value.links.map((link, index) => (
          <div key={link.id} className="flex flex-col gap-1 rounded border border-slate-800 p-2">
            <div className="flex gap-2">
              <div className="flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => moveLink(index, -1)}
                  disabled={index === 0}
                  className="text-xs text-slate-500 hover:text-sky-400 disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Move bookmark up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => moveLink(index, 1)}
                  disabled={index === value.links.length - 1}
                  className="text-xs text-slate-500 hover:text-sky-400 disabled:pointer-events-none disabled:opacity-30"
                  aria-label="Move bookmark down"
                >
                  ▼
                </button>
              </div>
              <input
                type="url"
                value={link.url}
                onChange={(e) => updateLink(link.id, { url: e.target.value })}
                placeholder="https://example.com"
                className="min-w-0 flex-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
              />
              <button
                type="button"
                onClick={() => removeLink(link.id)}
                className="shrink-0 text-xs text-slate-500 hover:text-red-400"
                aria-label="Remove bookmark"
              >
                ✕
              </button>
            </div>
            <input
              type="text"
              value={link.title ?? ''}
              onChange={(e) => updateLink(link.id, { title: e.target.value || undefined })}
              placeholder="Title (optional, defaults to hostname)"
              className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addLink}
        className="self-start rounded border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:border-sky-500 hover:text-sky-400"
      >
        + Add link
      </button>
    </div>
  );
}
