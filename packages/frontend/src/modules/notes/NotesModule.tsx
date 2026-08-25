import { useRef, useState } from 'react';
import type { NotesConfig } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { useUpdateModuleInstance } from '../../hooks/useTabs';

const SAVE_DEBOUNCE_MS = 600;

export function NotesModule({ instance }: ModuleDisplayProps<NotesConfig, unknown>) {
  const updateInstance = useUpdateModuleInstance();
  const [text, setText] = useState(instance.config?.text ?? '');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function save(value: string): void {
    updateInstance.mutate({ id: instance.id, config: { ...instance.config, text: value } });
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    const value = e.target.value;
    setText(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(value), SAVE_DEBOUNCE_MS);
  }

  function handleBlur(): void {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    save(text);
  }

  return (
    <textarea
      value={text}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="Type a note…"
      className="min-h-32 w-full flex-1 resize-y rounded border border-slate-800 bg-slate-950 p-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-slate-600 focus:outline-none"
    />
  );
}
