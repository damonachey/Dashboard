import type { StockChartConfig, StockChartModuleData, StockChartPoint } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { finvizUrl } from '../stock-quotes/finvizUrl';

const CHART_WIDTH = 280;
const CHART_HEIGHT = 100;

function scaleY(value: number, min: number, max: number): number {
  const span = max - min || 1;
  return CHART_HEIGHT - ((value - min) / span) * CHART_HEIGHT;
}

function buildLinePath(points: StockChartPoint[], min: number, max: number): string {
  const stepX = points.length > 1 ? CHART_WIDTH / (points.length - 1) : 0;

  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * stepX).toFixed(2)},${scaleY(p.close, min, max).toFixed(2)}`)
    .join(' ');
}

function LineSeries({ points, min, max, color }: { points: StockChartPoint[]; min: number; max: number; color: string }) {
  return <path d={buildLinePath(points, min, max)} fill="none" stroke={color} strokeWidth={1.5} />;
}

function CandlestickSeries({ points, min, max }: { points: StockChartPoint[]; min: number; max: number }) {
  const slot = CHART_WIDTH / points.length;
  const bodyWidth = Math.max(1, slot * 0.6);

  return (
    <>
      {points.map((p, i) => {
        const x = i * slot + slot / 2;
        const color = p.close >= p.open ? '#34d399' : '#fb7185';
        const yHigh = scaleY(p.high, min, max);
        const yLow = scaleY(p.low, min, max);
        const yOpen = scaleY(p.open, min, max);
        const yClose = scaleY(p.close, min, max);
        const bodyTop = Math.min(yOpen, yClose);
        const bodyHeight = Math.max(1, Math.abs(yClose - yOpen));

        return (
          <g key={p.t}>
            <line x1={x} x2={x} y1={yHigh} y2={yLow} stroke={color} strokeWidth={1} />
            <rect x={x - bodyWidth / 2} y={bodyTop} width={bodyWidth} height={bodyHeight} fill={color} />
          </g>
        );
      })}
    </>
  );
}

function formatPrice(price: number, currency: string | null): string {
  const formatted = price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency && currency !== 'USD' ? `${formatted} ${currency}` : `$${formatted}`;
}

export function StockChartModule({ instance, envelope }: ModuleDisplayProps<StockChartConfig, StockChartModuleData>) {
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

  const min = Math.min(...points.map((p) => p.low));
  const max = Math.max(...points.map((p) => p.high));

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
        {instance.config.chartType === 'candlestick' ? (
          <CandlestickSeries points={points} min={min} max={max} />
        ) : (
          <LineSeries points={points} min={min} max={max} color={lineColor} />
        )}
      </svg>
    </div>
  );
}
