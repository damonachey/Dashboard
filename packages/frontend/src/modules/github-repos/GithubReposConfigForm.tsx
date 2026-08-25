import type { GithubReposConfig } from '@dashboard/shared';
import type { ModuleConfigFormProps } from '../registry';

export function GithubReposConfigForm({ value, onChange }: ModuleConfigFormProps<GithubReposConfig>) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Show
        <select
          value={value.scope}
          onChange={(e) => onChange({ ...value, scope: e.target.value as GithubReposConfig['scope'] })}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1"
        >
          <option value="owned">My repos</option>
          <option value="starred">Starred repos</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Sort by
        <select
          value={value.sort}
          onChange={(e) => onChange({ ...value, sort: e.target.value as GithubReposConfig['sort'] })}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1"
        >
          <option value="pushed">Recently pushed</option>
          <option value="updated">Recently updated</option>
          <option value="created">Recently created</option>
          <option value="full_name">Name</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Max repos shown
        <input
          type="number"
          min={1}
          max={50}
          value={value.limit}
          onChange={(e) => onChange({ ...value, limit: Number(e.target.value) })}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1"
        />
      </label>
    </div>
  );
}
