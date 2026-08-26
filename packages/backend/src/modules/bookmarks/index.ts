import { bookmarksConfigSchema, type BookmarksConfig } from '@dashboard/shared';
import type { ModuleDefinition } from '../types.js';

// No fetchData: bookmarks are purely user-entered links stored in the instance's own config,
// same as notes/embed — nothing for the scheduler to poll.
export const bookmarksModule: ModuleDefinition<BookmarksConfig, never> = {
  meta: {
    id: 'bookmarks',
    displayName: 'Bookmarks',
    kind: 'local',
  },
  configSchema: bookmarksConfigSchema,
};
