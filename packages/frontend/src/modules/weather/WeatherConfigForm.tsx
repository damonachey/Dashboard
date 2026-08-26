import type { WeatherConfig } from '@dashboard/shared';
import type { ModuleConfigFormProps } from '../registry';

export function WeatherConfigForm({ value, onChange }: ModuleConfigFormProps<WeatherConfig>) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Zip code, city/state, or PWS station ID
        <input
          type="text"
          value={value.location}
          onChange={(e) => onChange({ ...value, location: e.target.value })}
          placeholder="10001, San Francisco, CA, or KCASANFR123"
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 font-mono"
        />
        <span className="text-xs text-slate-500">
          A 5-digit US zip code, a "City, ST" name, or a Weather Underground personal weather station ID.
        </span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Title (optional)
        <input
          type="text"
          value={value.title ?? ''}
          onChange={(e) => onChange({ ...value, title: e.target.value || undefined })}
          placeholder="Weather Underground"
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1"
        />
      </label>
    </div>
  );
}
