import type { WeatherModuleData } from '@dashboard/shared';
import type { ModuleDisplayProps } from '../registry';
import { HighlightableListItem } from '../../components/HighlightableListItem';

export function WeatherModule({ envelope, highlightedItemId }: ModuleDisplayProps<unknown, WeatherModuleData>) {
  const data = envelope?.data;
  const days = data?.days ?? [];

  if (days.length === 0) {
    return <p className="text-sm text-slate-400">No forecast data.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {data?.location && <div className="text-xs text-slate-500">{data.location}</div>}
      <ul className="flex gap-3 overflow-x-auto">
        {days.map((day) => (
          <HighlightableListItem
            key={day.id}
            active={day.id === highlightedItemId}
            className="flex w-16 shrink-0 flex-col items-center gap-1 text-center"
          >
            <div className="text-xs text-slate-400">{day.date}</div>
            {day.iconUrl && <img src={day.iconUrl} alt={day.condition ?? ''} width={36} height={36} />}
            <div className="text-xs text-slate-200">
              {day.high !== null ? `${day.high}°` : '--'} / {day.low !== null ? `${day.low}°` : '--'}
            </div>
            {day.condition && <div className="text-[11px] leading-tight text-slate-500">{day.condition}</div>}
          </HighlightableListItem>
        ))}
      </ul>
    </div>
  );
}
