import { chromium } from 'playwright';
import { embedConfigSchema, type EmbedConfig, type EmbedScreenshotData } from '@dashboard/shared';
import type { ModuleDefinition } from '../types.js';

// Only 'screenshot' mode needs backend work — iframe/link modes render the URL directly in the
// frontend and have nothing to poll for, so fetchData is a no-op (no browser launch) for them.
async function fetchData(config: EmbedConfig): Promise<EmbedScreenshotData | null> {
  if (config.mode !== 'screenshot') return null;

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const buffer = await page.screenshot({ type: 'png' });
    return { screenshotDataUrl: `data:image/png;base64,${buffer.toString('base64')}` };
  } finally {
    await browser.close();
  }
}

export const embedModule: ModuleDefinition<EmbedConfig, EmbedScreenshotData | null> = {
  meta: {
    id: 'embed',
    displayName: 'Embedded Site',
    kind: 'api',
    defaultPollIntervalMs: 15 * 60 * 1000,
  },
  configSchema: embedConfigSchema,
  fetchData,
};
