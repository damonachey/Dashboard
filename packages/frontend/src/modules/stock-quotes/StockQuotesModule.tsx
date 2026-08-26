import type { StockQuotesModuleData } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { HighlightableListItem } from '../../components/HighlightableListItem';
import { finvizUrl } from './finvizUrl';

function formatPrice(price: number | null, currency: string | null): string {
  if (price === null) return '—';
  const formatted = price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency && currency !== 'USD' ? `${formatted} ${currency}` : `$${formatted}`;
}

function formatChange(change: number | null, changePercent: number | null): string | null {
  if (change === null) return null;
  const sign = change >= 0 ? '+' : '';
  const pct = changePercent !== null ? ` (${sign}${changePercent.toFixed(2)}%)` : '';
  return `${sign}${change.toFixed(2)}${pct}`;
}

export function StockQuotesModule({
  envelope,
  highlightedItemId,
}: ModuleDisplayProps<unknown, StockQuotesModuleData>) {
  const quotes = envelope?.data?.quotes ?? [];

  if (quotes.length === 0) {
    return <p className="text-sm text-slate-400">No tickers configured.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 overflow-y-auto">
      {quotes.map((quote) => {
        if (quote.error) {
          return (
            <HighlightableListItem
              key={quote.symbol}
              active={quote.symbol === highlightedItemId}
              className="border-b border-slate-800 pb-2 last:border-0"
            >
              <a
                href={finvizUrl(quote.symbol)}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-slate-100 hover:text-sky-400"
              >
                {quote.symbol}
              </a>
              <div className="text-xs text-rose-400">{quote.error}</div>
            </HighlightableListItem>
          );
        }

        const changeText = formatChange(quote.change, quote.changePercent);
        const changeColor =
          quote.change === null
            ? 'text-slate-500'
            : quote.change > 0
              ? 'text-emerald-400'
              : quote.change < 0
                ? 'text-rose-400'
                : 'text-slate-500';

        return (
          <HighlightableListItem
            key={quote.symbol}
            active={quote.symbol === highlightedItemId}
            className="flex items-baseline justify-between gap-2 border-b border-slate-800 pb-2 last:border-0"
          >
            <div className="min-w-0">
              <a
                href={finvizUrl(quote.symbol)}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-slate-100 hover:text-sky-400"
              >
                {quote.symbol}
              </a>
              {quote.name && <div className="truncate text-xs text-slate-500">{quote.name}</div>}
            </div>
            <div className="shrink-0 text-right">
              <div className="text-sm text-slate-100">{formatPrice(quote.price, quote.currency)}</div>
              {changeText && <div className={`text-xs ${changeColor}`}>{changeText}</div>}
            </div>
          </HighlightableListItem>
        );
      })}
    </ul>
  );
}
