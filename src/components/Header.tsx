import { useState, useRef, useEffect, useMemo } from 'react';
import type { ProductionFilter, MapMode, PesticideData } from '../types';
import { PRODUCTION_FILTERS, MAP_MODE_LABELS } from '../types';

interface Props {
  showBio: boolean;
  showPesticides: boolean;
  onToggleBio: () => void;
  onTogglePesticides: () => void;
  productionFilter: ProductionFilter;
  onProductionFilterChange: (f: ProductionFilter) => void;
  mapMode: MapMode;
  onMapModeChange: (m: MapMode) => void;
  pesticides: PesticideData | null;
  onDeptSearch: (code: string) => void;
  onToggleStats: () => void;
}

export function Header({
  showBio,
  showPesticides,
  onToggleBio,
  onTogglePesticides,
  productionFilter,
  onProductionFilterChange,
  mapMode,
  onMapModeChange,
  pesticides,
  onDeptSearch,
  onToggleStats,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Department list for search
  const departments = useMemo(() => {
    if (!pesticides) return [];
    return Object.entries(pesticides.departments)
      .map(([code, d]) => ({ code, nom: d.nom }))
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }, [pesticides]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return departments;
    const q = searchQuery.toLowerCase();
    return departments.filter(
      (d) => d.nom.toLowerCase().includes(q) || d.code.includes(q),
    );
  }, [departments, searchQuery]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="glass pointer-events-auto absolute top-0 right-0 left-0 z-20 border-b border-gray-200/50 px-4 py-2.5 shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3">
        {/* Title */}
        <div className="mr-auto flex items-center gap-2">
          <svg
            className="h-5 w-5 text-emerald-600"
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
          <h1 className="text-base font-semibold text-gray-800">
            Agriculture Durable
          </h1>
        </div>

        {/* Department search */}
        <div className="relative" ref={searchRef}>
          <input
            type="text"
            placeholder="Rechercher un dept..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            className="w-44 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
          {searchOpen && filtered.length > 0 && (
            <div className="absolute top-full left-0 z-50 mt-1 max-h-48 w-56 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {filtered.slice(0, 20).map((d) => (
                <button
                  key={d.code}
                  onClick={() => {
                    onDeptSearch(d.code);
                    setSearchQuery('');
                    setSearchOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs hover:bg-emerald-50"
                >
                  <span className="font-mono text-gray-400">{d.code}</span>
                  <span className="text-gray-700">{d.nom}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Map mode */}
        <select
          value={mapMode}
          onChange={(e) => onMapModeChange(e.target.value as MapMode)}
          className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
        >
          {(Object.keys(MAP_MODE_LABELS) as MapMode[]).map((m) => (
            <option key={m} value={m}>{MAP_MODE_LABELS[m]}</option>
          ))}
        </select>

        {/* Layer toggles */}
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={showBio}
              onChange={onToggleBio}
              className="accent-emerald-600"
            />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-600" />
            <span className="hidden text-gray-700 sm:inline">Bio</span>
          </label>

          <label className="flex cursor-pointer items-center gap-1.5 text-xs">
            <input
              type="checkbox"
              checked={showPesticides}
              onChange={onTogglePesticides}
              className="accent-red-600"
            />
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-600" />
            <span className="hidden text-gray-700 sm:inline">Pesticides</span>
          </label>
        </div>

        {/* Production filter */}
        {showBio && (
          <select
            value={productionFilter}
            onChange={(e) => onProductionFilterChange(e.target.value as ProductionFilter)}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-700 shadow-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            {PRODUCTION_FILTERS.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        )}

        {/* Stats button */}
        <button
          onClick={onToggleStats}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
        >
          Statistiques
        </button>
      </div>
    </header>
  );
}
