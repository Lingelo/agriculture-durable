import type { BioFarm } from '../types';

interface Props {
  farm: BioFarm;
}

/** React component version for potential use outside Leaflet markers */
export function BioPopup({ farm }: Props) {
  const prods = farm.productions.slice(0, 6).join(', ');
  const more = farm.productions.length > 6
    ? ` (+${farm.productions.length - 6})`
    : '';

  return (
    <div className="min-w-[180px] max-w-[260px]">
      <div className="mb-1 text-sm font-semibold text-gray-800">{farm.nom}</div>
      <div className="mb-1.5 text-xs text-gray-500">
        {farm.ville} ({farm.dept})
      </div>
      <span className="mb-1.5 inline-block rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
        {farm.status}
      </span>
      <div className="text-xs text-gray-700">
        <span className="font-medium">Productions :</span> {prods}{more}
      </div>
    </div>
  );
}
