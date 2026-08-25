import type { EmbedConfig, ModuleInstance } from '@dashboard/shared';
import { getHostname, getFaviconUrl } from './url';

export function embedTitle(instance: ModuleInstance<EmbedConfig>): string | undefined {
  if (instance.config?.title) return instance.config.title;
  return instance.config?.url ? getHostname(instance.config.url) : undefined;
}

export function embedTitleIcon(instance: ModuleInstance<EmbedConfig>): string | undefined {
  return instance.config?.url ? getFaviconUrl(instance.config.url) : undefined;
}

export function embedSourceUrl(instance: ModuleInstance<EmbedConfig>): string | undefined {
  return instance.config?.url || undefined;
}
