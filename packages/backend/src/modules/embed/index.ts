import { embedConfigSchema, type EmbedConfig } from '@dashboard/shared';
import type { ModuleDefinition } from '../types.js';

export const embedModule: ModuleDefinition<EmbedConfig, never> = {
  meta: {
    id: 'embed',
    displayName: 'Embedded Site',
    kind: 'embed',
  },
  configSchema: embedConfigSchema,
};
