import {
  stockChartConfigSchema,
  type StockChartConfig,
  type StockChartModuleData,
  type StockChartPoint,
} from '@dashboard/shared';
import type { ModuleDefinition } from '../types.js';
import { RateLimitedError } from '../../util/errors.js';

// Same Yahoo chart endpoint the stock-quotes module uses, but with a wider range/interval
// chosen per timeframe instead of the quotes module's fixed "today only" 1d/1d request.
const TIMEFRAME_PARAMS: Record<StockChartConfig['timeframe'], { interval: string; range: string }> = {
  '5m': { interval: '5m', range: '5d' },
  '60m': { interval: '60m', range: '3mo' },
  daily: { interval: '1d', range: '3mo' },
  weekly: { interval: '1wk', range: '2y' },
  monthly: { interval: '1mo', range: '10y' },
};

interface YahooChartResult {
  meta?: { symbol?: string; currency?: string; longName?: string; shortName?: string };
  timestamp?: number[];
  indicators?: {
    quote?: [
      {
        close?: (number | null)[];
        open?: (number | null)[];
        high?: (number | null)[];
        low?: (number | null)[];
      },
    ];
  };
}

interface YahooChartResponse {
  chart: {
    result?: [YahooChartResult] | null;
    error?: { code: string; description: string } | null;
  };
}

async function fetchData(config: StockChartConfig): Promise<StockChartModuleData> {
  const symbol = config.symbol.trim().toUpperCase();
  const { interval, range } = TIMEFRAME_PARAMS[config.timeframe];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${interval}&range=${range}`;

  const res = await fetch(url, { headers: { 'User-Agent': 'dashboard-app' } });
  if (res.status === 429) {
    throw new RateLimitedError('Yahoo Finance rate limited (429)', 5 * 60 * 1000);
  }
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching chart for "${symbol}"`);
  }

  const json = (await res.json()) as YahooChartResponse;
  const result = json.chart.result?.[0];
  if (!result || json.chart.error) {
    throw new Error(json.chart.error?.description ?? `Unknown ticker "${symbol}"`);
  }

  const timestamps = result.timestamp ?? [];
  const quote = result.indicators?.quote?.[0];
  const closes = quote?.close ?? [];
  const opens = quote?.open ?? [];
  const highs = quote?.high ?? [];
  const lows = quote?.low ?? [];
  const points: StockChartPoint[] = [];
  for (let i = 0; i < timestamps.length; i++) {
    const close = closes[i];
    if (close === null || close === undefined) continue;
    points.push({
      t: new Date(timestamps[i] * 1000).toISOString(),
      close,
      // Fall back to close for any missing OHLC leg (Yahoo sometimes has gaps mid-array) so a
      // candlestick still renders as a flat doji instead of the point being dropped entirely.
      open: opens[i] ?? close,
      high: highs[i] ?? close,
      low: lows[i] ?? close,
    });
  }

  return {
    symbol: result.meta?.symbol ?? symbol,
    name: result.meta?.longName ?? result.meta?.shortName ?? null,
    currency: result.meta?.currency ?? null,
    points,
  };
}

export const stockChartModule: ModuleDefinition<StockChartConfig, StockChartModuleData> = {
  meta: {
    id: 'stock-chart',
    displayName: 'Stock Chart',
    kind: 'api',
    defaultPollIntervalMs: 15 * 60 * 1000,
  },
  configSchema: stockChartConfigSchema,
  fetchData,
};
