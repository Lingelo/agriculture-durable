import { useState, useMemo } from 'react';
import { useData } from './hooks/useData';
import { timeAgo } from './utils/format';
import { MapView } from './components/MapView';
import { Header } from './components/Header';
import { DepartmentPanel } from './components/DepartmentPanel';
import { Legend } from './components/Legend';
import { AboutModal } from './components/AboutModal';
import type { ProductionFilter } from './types';
import { PRODUCTION_KEYWORDS } from './types';

function App() {
  const { bioFarms, pesticides, departmentsGeo, loading, error } = useData();

  const [showBio, setShowBio] = useState(true);
  const [showPesticides, setShowPesticides] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [productionFilter, setProductionFilter] =
    useState<ProductionFilter>('Toutes');
  const [showAbout, setShowAbout] = useState(false);

  // Filter bio farms by production type
  const filteredBioFarms = useMemo(() => {
    if (productionFilter === 'Toutes') return bioFarms;
    const keywords = PRODUCTION_KEYWORDS[productionFilter];
    return bioFarms.filter((farm) =>
      farm.productions.some((prod) => {
        const lower = prod.toLowerCase();
        return keywords.some((kw) => lower.includes(kw));
      }),
    );
  }, [bioFarms, productionFilter]);

  const maxPesticideValue = useMemo(() => {
    if (!pesticides) return 0;
    return Math.max(
      ...Object.values(pesticides.departments).map((d) => d.total),
    );
  }, [pesticides]);

  const selectedPesticides = selectedDept && pesticides
    ? pesticides.departments[selectedDept] ?? null
    : null;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm text-gray-600">
            Chargement des donnees...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="rounded-lg bg-red-50 p-6 text-center">
          <p className="font-medium text-red-700">Erreur</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Map */}
      <MapView
        bioFarms={filteredBioFarms}
        pesticides={pesticides?.departments ?? null}
        departmentsGeo={departmentsGeo}
        showBio={showBio}
        showPesticides={showPesticides}
        onDepartmentClick={setSelectedDept}
        selectedDept={selectedDept}
      />

      {/* UI overlays — pointer-events-none container */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <Header
          showBio={showBio}
          showPesticides={showPesticides}
          onToggleBio={() => setShowBio((v) => !v)}
          onTogglePesticides={() => setShowPesticides((v) => !v)}
          productionFilter={productionFilter}
          onProductionFilterChange={setProductionFilter}
        />

        <Legend maxValue={maxPesticideValue} visible={showPesticides} />

        <DepartmentPanel
          deptCode={selectedDept ?? ''}
          pesticides={selectedPesticides}
          bioFarms={bioFarms}
          onClose={() => setSelectedDept(null)}
          visible={selectedDept !== null}
        />
      </div>

      {/* Stats summary + footer */}
      <div className="glass pointer-events-auto absolute right-4 bottom-6 z-20 hidden rounded-lg border border-gray-200/50 px-3 py-2 text-xs text-gray-600 shadow-sm md:block">
        {filteredBioFarms.length.toLocaleString('fr-FR')} fermes bio
        {pesticides && (
          <> | {Object.keys(pesticides.departments).length} departements</>
        )}
        {pesticides?.meta.generatedAt && (
          <> | {timeAgo(pesticides.meta.generatedAt)}</>
        )}
        {' | '}
        <button onClick={() => setShowAbout(true)} className="underline hover:text-gray-900">
          A propos
        </button>
      </div>

      {showAbout && (
        <AboutModal
          onClose={() => setShowAbout(false)}
          lastUpdate={pesticides?.meta.generatedAt}
        />
      )}
    </div>
  );
}

export default App;
