import type { StockChartConfig, StockChartModuleData, StockChartPoint } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { finvizUrl } from '../stock-quotes/finvizUrl';

const CHART_WIDTH = 280;
const CHART_HEIGHT = 100;

function buildPath(points: StockChartPoint[]): string {
  const closes = points.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = max - min || 1;
  const stepX = points.length > 1 ? CHART_WIDTH / (points.length - 1) : 0;

  return points
    .map((p, i) => {
      const x = i * stepX;
      const y = CHART_HEIGHT - ((p.close - min) / span) * CHART_HEIGHT;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');
}

function formatPrice(price: number, currency: string | null): string {
  const formatted = price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency && currency !== 'USD' ? `${formatted} ${currency}` : `$${formatted}`;
}

export function StockChartModule({ envelope }: ModuleDisplayProps<StockChartConfig, StockChartModuleData>) {
  const data = envelope?.data;
  const points = data?.points ?? [];

  if (points.length === 0) {
    return <p className="text-sm text-slate-400">No chart data yet.</p>;
  }

  const first = points[0].close;
  const last = points[points.length - 1].close;
  const change = last - first;
  const changePercent = first ? (change / first) * 100 : 0;
  const lineColor = change > 0 ? '#34d399' : change < 0 ? '#fb7185' : '#94a3b8';
  const changeColor = change > 0 ? 'text-emerald-400' : change < 0 ? 'text-rose-400' : 'text-slate-500';
  const sign = change >= 0 ? '+' : '';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2">
        <div className="min-w-0">
          {data?.symbol && (
            <a
              href={finvizUrl(data.symbol)}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-slate-100 hover:text-sky-400"
            >
              {data.symbol}
            </a>
          )}
          {data?.name && <div className="truncate text-xs text-slate-500">{data.name}</div>}
        </div>
        <div className="shrink-0 text-right">
          <div className="text-sm text-slate-100">{formatPrice(last, data?.currency ?? null)}</div>
          <div className={`text-xs ${changeColor}`}>
            {sign}
            {change.toFixed(2)} ({sign}
            {changePercent.toFixed(2)}%)
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} preserveAspectRatio="none" className="h-24 w-full">
        <path d={buildPath(points)} fill="none" stroke={lineColor} strokeWidth={1.5} />
      </svg>
    </div>
  );
}
