// components/run/RunStats.tsx
import { formatDuration } from '@/utils/helpers';

interface Props {
  distance: number;     // meter
  duration: number;     // sek
  elevation?: number;   // meter (valgfri)
}

export default function RunStats({ distance, duration, elevation }: Props) {
  const pace = duration && distance
    ? duration / (distance / 1000)   // sek / km
    : 0;

  return (
    <div className="grid grid-cols-3 text-center my-4">
      <Stat label="Distanse" value={`${(distance / 1000).toFixed(2)} km`} />
      <Stat label="Tid"      value={formatDuration(duration)} />
      <Stat label="Snitt /km" value={pace ? formatDuration(pace) : '–'} />
      {elevation !== undefined && (
        <Stat label="↑↓" value={`${Math.round(elevation)} m`} />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-lg font-semibold whitespace-nowrap">{value}</p>
    </div>
  );
}