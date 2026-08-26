import type { StockChartConfig, StockChartTimeframe, StockChartType } from '@dashboard/shared';
import type { ModuleConfigFormProps } from '../registry';

const TIMEFRAME_OPTIONS: { value: StockChartTimeframe; label: string }[] = [
  { value: '5m', label: '5 Minute' },
  { value: '60m', label: '60 Minute' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const CHART_TYPE_OPTIONS: { value: StockChartType; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'candlestick', label: 'Candlestick' },
];

export function StockChartConfigForm({ value, onChange }: ModuleConfigFormProps<StockChartConfig>) {
  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Symbol
        <input
          type="text"
          value={value.symbol}
          onChange={(e) => onChange({ ...value, symbol: e.target.value.toUpperCase() })}
          placeholder="AAPL"
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1 font-mono"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Timeframe
        <select
          value={value.timeframe}
          onChange={(e) => onChange({ ...value, timeframe: e.target.value as StockChartTimeframe })}
          className="rounded border border-slate-700 bg-slate-900 px-2 py-1"
        >
          {TIMEFRAME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <fieldset className="flex flex-col gap-1 text-sm">
        <legend className="mb-1">Chart type</legend>
        {CHART_TYPE_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              name="stock-chart-type"
              checked={value.chartType === option.value}
              onChange={() => onChange({ ...value, chartType: option.value })}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    </div>
  );
}
