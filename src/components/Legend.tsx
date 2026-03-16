import { PESTICIDE_SCALE, PARADOX_SCALE } from '../utils/colors';
import type { MapMode } from '../types';
import { MAP_MODE_LABELS } from '../types';

interface Props {
  maxValue: number;
  visible: boolean;
  mapMode: MapMode;
}

const UNITS: Record<MapMode, string> = {
  pesticides: 'kg/dept.',
  pesticides_ha: 'kg/ha',
  paradoxe: 'score',
};

export function Legend({ maxValue, visible, mapMode }: Props) {
  if (!visible || maxValue <= 0) return null;

  const scale = mapMode === 'paradoxe' ? PARADOX_SCALE : PESTICIDE_SCALE;
  const steps = scale.length;
  const labels = Array.from({ length: steps }, (_, i) => {
    const val = Math.round(Math.pow((i / steps) * Math.sqrt(maxValue), 2));
    if (mapMode === 'pesticides_ha') {
      return val.toFixed(0);
    }
    if (mapMode === 'paradoxe') {
      return val.toFixed(0);
    }
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1000) return `${Math.round(val / 1000)}k`;
    return String(val);
  });

  return (
    <div className="glass pointer-events-auto absolute bottom-6 left-4 z-20 rounded-lg border border-gray-200/50 px-3 py-2 shadow-sm">
      <div className="mb-1 text-xs font-medium text-gray-600">
        {MAP_MODE_LABELS[mapMode]} ({UNITS[mapMode]})
      </div>
      <div className="flex items-end gap-px">
        {scale.map((color, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className="w-6 rounded-sm"
              style={{
                backgroundColor: color,
                height: `${12 + i * 2}px`,
              }}
            />
            <span className="mt-0.5 text-[9px] text-gray-500">
              {labels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
