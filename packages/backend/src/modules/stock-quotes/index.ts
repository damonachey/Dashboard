import {
  stockQuotesConfigSchema,
  type StockQuotesConfig,
  type StockQuoteItem,
  type StockQuotesModuleData,
} from '@dashboard/shared';
import type { ModuleDefinition } from '../types.js';
import { RateLimitedError } from '../../util/errors.js';

// Yahoo's batch quote endpoint (v7/finance/quote) now requires a crumb+cookie handshake and
// returns 401 without it. The per-symbol chart endpoint has no such requirement, so we fetch
// tickers individually (in parallel) instead of as one batched request.
const CHART_URL = (symbol: string) =>
  `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`;

const MAX_TICKERS = 30;

interface YahooChartMeta {
  symbol?: string;
  currency?: string;
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  regularMarketTime?: number;
  longName?: string;
  shortName?: string;
}

interface YahooChartResponse {
  chart: {
    result?: [{ meta: YahooChartMeta }] | null;
    error?: { code: string; description: string } | null;
  };
}

function parseTickers(raw: string): string[] {
  const seen = new Set<string>();
  for (const part of raw.split(',')) {
    const symbol = part.trim().toUpperCase();
    if (symbol) seen.add(symbol);
  }
  return Array.from(seen).slice(0, MAX_TICKERS);
}

function errorQuote(symbol: string, message: string): StockQuoteItem {
  return {
    id: symbol,
    symbol,
    name: null,
    price: null,
    previousClose: null,
    change: null,
    changePercent: null,
    currency: null,
    marketTime: null,
    error: message,
  };
}

async function fetchQuote(symbol: string): Promise<StockQuoteItem> {
  let res: Response;
  try {
    res = await fetch(CHART_URL(symbol), { headers: { 'User-Agent': 'dashboard-app' } });
  } catch (err) {
    return errorQuote(symbol, err instanceof Error ? err.message : 'Network error');
  }

  if (res.status === 429) {
    throw new RateLimitedError('Yahoo Finance rate limited (429)', 5 * 60 * 1000);
  }
  if (!res.ok) {
    return errorQuote(symbol, `HTTP ${res.status}`);
  }

  const json = (await res.json()) as YahooChartResponse;
  const meta = json.chart.result?.[0]?.meta;
  if (!meta || json.chart.error) {
    return errorQuote(symbol, json.chart.error?.description ?? 'Unknown ticker');
  }

  const price = meta.regularMarketPrice ?? null;
  const previousClose = meta.previousClose ?? meta.chartPreviousClose ?? null;
  const change = price !== null && previousClose !== null ? price - previousClose : null;
  const changePercent = change !== null && previousClose ? (change / previousClose) * 100 : null;

  return {
    id: meta.symbol ?? symbol,
    symbol: meta.symbol ?? symbol,
    name: meta.longName ?? meta.shortName ?? null,
    price,
    previousClose,
    change,
    changePercent,
    currency: meta.currency ?? null,
    marketTime: meta.regularMarketTime ? new Date(meta.regularMarketTime * 1000).toISOString() : null,
    error: null,
  };
}

async function fetchData(config: StockQuotesConfig): Promise<StockQuotesModuleData> {
  const tickers = parseTickers(config.tickers);
  const quotes = await Promise.all(tickers.map(fetchQuote));
  return { quotes };
}

export const stockQuotesModule: ModuleDefinition<StockQuotesConfig, StockQuotesModuleData> = {
  meta: {
    id: 'stock-quotes',
    displayName: 'Stock Quotes',
    kind: 'api',
    defaultPollIntervalMs: 5 * 60 * 1000,
  },
  configSchema: stockQuotesConfigSchema,
  fetchData,
};
