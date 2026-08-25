import { useState } from 'react';
import type { EmbedConfig } from '@dashboard/shared';
import type { ModuleConfigFormProps } from '../registry';

const KNOWN_FRAME_BLOCKED_HOSTS = ['twitter.com', 'x.com'];

function isKnownBlocked(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return KNOWN_FRAME_BLOCKED_HOSTS.includes(hostname);
  } catch {
    return false;
  }
}

export function EmbedConfigForm({ value, onChange }: ModuleConfigFormProps<EmbedConfig>) {
  const [url, setUrl] = useState(value.url ?? '');

  function handleUrlChange(next: string): void {
    setUrl(next);
    onChange({ ...value, url: next, mode: isKnownBlocked(next) ? 'link' : value.mode });
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        URL
        <input
          type="url"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="https://example.com"
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Title (optional)
        <input
          type="text"
          value={value.title ?? ''}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          placeholder="Defaults to the URL's hostname"
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1"
        />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={value.mode === 'link'}
          onChange={(e) => onChange({ ...value, url, mode: e.target.checked ? 'link' : 'iframe' })}
        />
        Open as link instead of embedding (some sites block embedding, e.g. X/Twitter)
      </label>
    </div>
  );
}
