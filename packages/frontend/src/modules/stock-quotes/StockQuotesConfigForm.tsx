import type { StockQuotesConfig } from '@dashboard/shared';
import type { ModuleConfigFormProps } from '../registry';

export function StockQuotesConfigForm({ value, onChange }: ModuleConfigFormProps<StockQuotesConfig>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      Tickers
      <input
        type="text"
        value={value.tickers}
        onChange={(e) => onChange({ ...value, tickers: e.target.value })}
        placeholder="AAPL,MSFT,GOOGL"
        className="rounded border border-slate-700 bg-slate-900 px-2 py-1 font-mono"
      />
      <span className="text-xs text-slate-500">Comma-separated ticker symbols.</span>
    </label>
  );
}
