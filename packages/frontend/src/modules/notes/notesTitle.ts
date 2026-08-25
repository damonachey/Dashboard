import type { ModuleInstance, NotesConfig } from '@dashboard/shared';

export function notesTitle(instance: ModuleInstance<NotesConfig>): string | undefined {
  return instance.config?.title || undefined;
}
