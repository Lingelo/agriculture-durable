import { PESTICIDE_SCALE } from '../utils/colors';

interface Props {
  maxValue: number;
  visible: boolean;
}

export function Legend({ maxValue, visible }: Props) {
  if (!visible || maxValue <= 0) return null;

  const steps = PESTICIDE_SCALE.length;
  const labels = Array.from({ length: steps }, (_, i) => {
    const val = Math.round(Math.pow((i / steps) * Math.sqrt(maxValue), 2));
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1000) return `${Math.round(val / 1000)}k`;
    return String(val);
  });

  return (
    <div className="glass pointer-events-auto absolute bottom-6 left-4 z-20 rounded-lg border border-gray-200/50 px-3 py-2 shadow-sm">
      <div className="mb-1 text-xs font-medium text-gray-600">
        Pesticides (kg/dept.)
      </div>
      <div className="flex items-end gap-px">
        {PESTICIDE_SCALE.map((color, i) => (
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
