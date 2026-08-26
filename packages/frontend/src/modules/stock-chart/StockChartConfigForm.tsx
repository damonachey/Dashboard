import type { StockChartConfig, StockChartTimeframe } from '@dashboard/shared';
import type { ModuleConfigFormProps } from '../registry';

const TIMEFRAME_OPTIONS: { value: StockChartTimeframe; label: string }[] = [
  { value: '5m', label: '5 Minute' },
  { value: '60m', label: '60 Minute' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
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
    </div>
  );
}
