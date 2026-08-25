import { notesConfigSchema, type NotesConfig } from '@dashboard/shared';
import type { ModuleDefinition } from '../types.js';

// No fetchData: notes are purely user-typed content stored in the instance's own config,
// same as embed's URL — nothing for the scheduler to poll.
export const notesModule: ModuleDefinition<NotesConfig, never> = {
  meta: {
    id: 'notes',
    displayName: 'Notes',
    kind: 'local',
  },
  configSchema: notesConfigSchema,
};
