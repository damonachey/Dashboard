import type { GmailConfig } from '@dashboard/shared';
import type { ModuleConfigFormProps } from '../registry';

export function GmailConfigForm({ value, onChange }: ModuleConfigFormProps<GmailConfig>) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Search query
        <input
          type="text"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          placeholder="is:unread"
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 font-mono"
        />
        <span className="text-xs text-slate-500">
          Any Gmail search syntax, e.g. <code>is:unread -category:promotions</code>
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Max messages shown
        <input
          type="number"
          min={1}
          max={50}
          value={value.maxResults}
          onChange={(e) => onChange({ ...value, maxResults: Number(e.target.value) })}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1"
        />
      </label>
    </div>
  );
}
