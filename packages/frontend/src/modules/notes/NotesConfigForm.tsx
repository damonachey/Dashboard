import type { NotesConfig } from '@dashboard/shared';
import type { ModuleConfigFormProps } from '../registry';

export function NotesConfigForm({ value, onChange }: ModuleConfigFormProps<NotesConfig>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      Title
      <input
        type="text"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        placeholder="Notes"
        className="rounded border border-slate-700 bg-slate-900 px-2 py-1"
      />
    </label>
  );
}
