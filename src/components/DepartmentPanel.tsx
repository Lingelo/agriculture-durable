import type { DepartmentPesticides, BioFarm } from '../types';
import { formatKg, formatNumber, formatRatio } from '../utils/format';

interface Props {
  deptCode: string;
  pesticides: DepartmentPesticides | null;
  bioFarms: BioFarm[];
  onClose: () => void;
  visible: boolean;
}

const FUNCTION_COLORS: Record<string, string> = {
  herbicide: '#f59e0b',
  fongicide: '#8b5cf6',
  insecticide: '#ef4444',
  autres: '#6b7280',
};

const FUNCTION_LABELS: Record<string, string> = {
  herbicide: 'Herbicides',
  fongicide: 'Fongicides',
  insecticide: 'Insecticides',
  autres: 'Autres',
};

export function DepartmentPanel({
  deptCode,
  pesticides,
  bioFarms,
  onClose,
  visible,
}: Props) {
  if (!visible) return null;

  const deptBioCount = bioFarms.filter((f) => f.dept === deptCode).length;
  const maxBar = pesticides
    ? Math.max(pesticides.herbicide, pesticides.fongicide, pesticides.insecticide, pesticides.autres, 1)
    : 1;

  return (
    <>
      {/* Desktop sidebar */}
      <div className="glass panel-scroll pointer-events-auto absolute top-0 right-0 bottom-0 z-20 hidden w-80 overflow-y-auto border-l border-gray-200/50 pt-16 shadow-lg md:block">
        <PanelContent
          deptCode={deptCode}
          pesticides={pesticides}
          deptBioCount={deptBioCount}
          maxBar={maxBar}
          onClose={onClose}
        />
      </div>

      {/* Mobile bottom sheet */}
      <div className="glass panel-scroll pointer-events-auto absolute right-0 bottom-0 left-0 z-20 max-h-[60vh] overflow-y-auto rounded-t-2xl border-t border-gray-200/50 shadow-lg md:hidden">
        <PanelContent
          deptCode={deptCode}
          pesticides={pesticides}
          deptBioCount={deptBioCount}
          maxBar={maxBar}
          onClose={onClose}
        />
      </div>
    </>
  );
}

function PanelContent({
  deptCode,
  pesticides,
  deptBioCount,
  maxBar,
  onClose,
}: {
  deptCode: string;
  pesticides: DepartmentPesticides | null;
  deptBioCount: number;
  maxBar: number;
  onClose: () => void;
}) {
  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            {pesticides?.nom ?? `Dept. ${deptCode}`}
          </h2>
          <span className="text-xs text-gray-500">Departement {deptCode}</span>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Summary cards */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-emerald-50 p-3">
          <div className="text-2xl font-bold text-emerald-700">
            {formatNumber(deptBioCount)}
          </div>
          <div className="text-xs text-emerald-600">Exploitations bio</div>
        </div>
        <div className="rounded-lg bg-red-50 p-3">
          <div className="text-2xl font-bold text-red-700">
            {pesticides ? formatKg(pesticides.total) : '--'}
          </div>
          <div className="text-xs text-red-600">Pesticides vendus</div>
        </div>
      </div>

      {/* Sustainability indicator */}
      {pesticides && (
        <div className="mb-4 rounded-lg bg-gray-50 p-3">
          <div className="mb-1 text-xs font-medium text-gray-600">
            Indice bio/pesticides
          </div>
          <div className="text-sm text-gray-700">
            {formatRatio(deptBioCount, pesticides.total)} fermes bio pour 100 tonnes de pesticides
          </div>
        </div>
      )}

      {/* Pesticides breakdown */}
      {pesticides && (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-gray-700">
            Repartition par fonction
          </h3>
          <div className="space-y-2">
            {(['herbicide', 'fongicide', 'insecticide', 'autres'] as const).map(
              (fn) => {
                const value = pesticides[fn];
                const pct = (value / maxBar) * 100;
                return (
                  <div key={fn}>
                    <div className="mb-0.5 flex items-center justify-between text-xs">
                      <span className="text-gray-600">
                        {FUNCTION_LABELS[fn]}
                      </span>
                      <span className="font-medium text-gray-800">
                        {formatKg(value)}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: FUNCTION_COLORS[fn],
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* Substances count */}
      {pesticides && (
        <div className="text-xs text-gray-500">
          {formatNumber(pesticides.nbSubstances)} substances actives
        </div>
      )}
    </div>
  );
}
