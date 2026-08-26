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

const MODE_OPTIONS = [
  { value: 'iframe', label: 'Embed', hint: 'Live iframe — not all sites allow this' },
  { value: 'screenshot', label: 'Screenshot', hint: 'Periodic snapshot, click to open the real site' },
  { value: 'link', label: 'Link only', hint: 'Just a link to open the site in a new tab' },
] as const;

export function EmbedConfigForm({ value, onChange }: ModuleConfigFormProps<EmbedConfig>) {
  const [url, setUrl] = useState(value.url ?? '');

  function handleUrlChange(next: string): void {
    setUrl(next);
    onChange({ ...value, url: next, mode: isKnownBlocked(next) ? 'screenshot' : value.mode });
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
      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="mb-1">Display mode</legend>
        {MODE_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              name="embed-mode"
              checked={value.mode === option.value}
              onChange={() => onChange({ ...value, url, mode: option.value })}
            />
            {option.label}
            <span className="text-xs text-slate-500">— {option.hint}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
