import type { GoogleCalendarConfig } from '@dashboard/shared';
import type { ModuleConfigFormProps } from '../registry';

export function GoogleCalendarConfigForm({ value, onChange }: ModuleConfigFormProps<GoogleCalendarConfig>) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Calendar ID
        <input
          type="text"
          value={value.calendarId}
          onChange={(e) => onChange({ ...value, calendarId: e.target.value })}
          placeholder="primary"
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 font-mono"
        />
        <span className="text-xs text-slate-500">
          <code>primary</code> for your main calendar, or another calendar&apos;s email-style ID from its Google
          Calendar settings.
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Days ahead
        <input
          type="number"
          min={1}
          max={60}
          value={value.daysAhead}
          onChange={(e) => onChange({ ...value, daysAhead: Number(e.target.value) })}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Max events shown
        <input
          type="number"
          min={1}
          max={100}
          value={value.maxResults}
          onChange={(e) => onChange({ ...value, maxResults: Number(e.target.value) })}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1"
        />
      </label>
    </div>
  );
}
