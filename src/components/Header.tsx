import type { ProductionFilter } from '../types';
import { PRODUCTION_FILTERS } from '../types';

interface Props {
  showBio: boolean;
  showPesticides: boolean;
  onToggleBio: () => void;
  onTogglePesticides: () => void;
  productionFilter: ProductionFilter;
  onProductionFilterChange: (f: ProductionFilter) => void;
}

export function Header({
  showBio,
  showPesticides,
  onToggleBio,
  onTogglePesticides,
  productionFilter,
  onProductionFilterChange,
}: Props) {
  return (
    <header className="glass pointer-events-auto absolute top-0 right-0 left-0 z-20 border-b border-gray-200/50 px-4 py-3 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4">
        {/* Title */}
        <div className="mr-auto flex items-center gap-2">
          <svg
            className="h-6 w-6 text-emerald-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22c4-4 8-7.5 8-12a8 8 0 00-16 0c0 4.5 4 8 8 12z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <h1 className="text-lg font-semibold text-gray-800">
            Agriculture Durable
          </h1>
        </div>

        {/* Layer toggles */}
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showBio}
              onChange={onToggleBio}
              className="accent-emerald-600"
            />
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-600" />
            <span className="text-gray-700">Exploitations bio</span>
          </label>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showPesticides}
              onChange={onTogglePesticides}
              className="accent-red-600"
            />
            <span className="inline-block h-3 w-3 rounded-full bg-red-600" />
            <span className="text-gray-700">Pesticides</span>
          </label>
        </div>

        {/* Production filter */}
        {showBio && (
          <select
            value={productionFilter}
            onChange={(e) =>
              onProductionFilterChange(e.target.value as ProductionFilter)
            }
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            {PRODUCTION_FILTERS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        )}
      </div>
    </header>
  );
}
