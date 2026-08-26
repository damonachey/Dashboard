import { chromium } from 'playwright';
import { weatherConfigSchema, type WeatherConfig, type WeatherModuleData } from '@dashboard/shared';
import type { ModuleDefinition } from '../types.js';

const ZIP_RE = /^\d{5}$/;

interface ZippopotamPlace {
  'place name': string;
  'state abbreviation': string;
  latitude: string;
  longitude: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
}

const NOMINATIM_USER_AGENT = 'dashboard-app/1.0 (personal local weather widget)';

async function geocodeZip(zip: string): Promise<{ target: string; location: string }> {
  const res = await fetch(`https://api.zippopotam.us/us/${zip}`);
  if (!res.ok) {
    throw new Error(`Unknown zip code "${zip}" (${res.status})`);
  }
  const data = (await res.json()) as { places?: ZippopotamPlace[] };
  const place = data.places?.[0];
  if (!place) {
    throw new Error(`Unknown zip code "${zip}"`);
  }

  return {
    target: `${place.latitude},${place.longitude}`,
    location: `${place['place name']}, ${place['state abbreviation']}`,
  };
}

// City/state names aren't a format wunderground.com's forecast route accepts directly (it wants
// a station ID or a "lat,lon" pair), so resolve via OpenStreetMap's free Nominatim geocoder —
// unrelated to, and no more than the occasional single lookup per poll interval, well within its
// usage policy (https://operations.osmfoundation.org/policies/nominatim/).
async function geocodeCityState(query: string): Promise<{ target: string; location: string }> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=us&format=json&limit=1`,
    { headers: { 'User-Agent': NOMINATIM_USER_AGENT } },
  );
  if (!res.ok) {
    throw new Error(`Location lookup failed for "${query}" (${res.status})`);
  }
  const [result] = (await res.json()) as NominatimResult[];
  if (!result) {
    throw new Error(`Unknown location "${query}"`);
  }

  return { target: `${result.lat},${result.lon}`, location: query };
}

// wunderground.com's state/city path segments are purely decorative for a PWS station ID or a
// "lat,lon" geocode (any placeholder works) — only the final segment is actually looked up. A
// bare zip code or city/state name in that slot is NOT resolved server-side, though, so those are
// geocoded first via free, keyless lookups unrelated to Weather Underground's own (paid) API.
async function resolveTarget(location: string): Promise<{ target: string; location: string }> {
  if (ZIP_RE.test(location)) return geocodeZip(location);
  if (location.includes(',')) return geocodeCityState(location);
  return { target: location, location };
}

function parseTemp(text: string | null): number | null {
  if (!text) return null;
  const n = parseInt(text, 10);
  return Number.isNaN(n) ? null : n;
}

async function fetchData(config: WeatherConfig): Promise<WeatherModuleData> {
  const { target, location } = await resolveTarget(config.location.trim());

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      viewport: { width: 1400, height: 1000 },
    });

    await page.goto(`https://www.wunderground.com/forecast/us/x/x/${encodeURIComponent(target)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page
      .waitForSelector('.forecast .obs-forecast', { timeout: 15000 })
      .catch(() => {
        // fall through — the page loaded but has no forecast rows (unknown station, etc.)
      });

    const days = await page.$$eval('.forecast-date .navigate-to, .forecast .obs-forecast', () => {
      const dates = Array.from(document.querySelectorAll('.forecast-date .navigate-to')).map(
        (e) => e.textContent?.trim() ?? '',
      );
      return Array.from(document.querySelectorAll('.forecast .obs-forecast')).map((el, i) => ({
        date: dates[i] ?? '',
        hi: el.querySelector('.temp-hi')?.textContent?.trim() ?? null,
        lo: el.querySelector('.temp-lo')?.textContent?.trim() ?? null,
        phrase: el.querySelector('.obs-phrase')?.textContent?.trim() ?? null,
        icon: el.querySelector('.obs-icon')?.getAttribute('src') ?? null,
      }));
    });

    if (days.length === 0) {
      throw new Error(`No forecast found for "${config.location}" — check the zip code or station ID`);
    }

    return {
      location,
      days: days.map((d) => ({
        id: d.date,
        date: d.date,
        high: parseTemp(d.hi),
        low: parseTemp(d.lo),
        condition: d.phrase,
        iconUrl: d.icon ? (d.icon.startsWith('//') ? `https:${d.icon}` : d.icon) : null,
      })),
    };
  } finally {
    await browser.close();
  }
}

export const weatherModule: ModuleDefinition<WeatherConfig, WeatherModuleData> = {
  meta: {
    id: 'weather',
    displayName: 'Weather Underground',
    kind: 'api',
    defaultPollIntervalMs: 30 * 60 * 1000,
  },
  configSchema: weatherConfigSchema,
  fetchData,
};
