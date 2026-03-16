import { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, CartesianGrid,
  ZAxis,
} from 'recharts';
import type { BioFarm, PesticideData, SAUData } from '../types';
import { formatKg, formatNumber, formatPerHa } from '../utils/format';

type Tab = 'classement' | 'repartition' | 'paradoxe';

interface Props {
  pesticides: PesticideData;
  bioFarms: BioFarm[];
  sau: SAUData | null;
  visible: boolean;
  onClose: () => void;
  onDeptClick: (code: string) => void;
}

const PIE_COLORS = ['#f59e0b', '#8b5cf6', '#ef4444', '#6b7280'];

export function StatsPanel({ pesticides, bioFarms, sau, visible, onClose, onDeptClick }: Props) {
  const [tab, setTab] = useState<Tab>('classement');

  // Pre-compute per-dept stats
  const deptStats = useMemo(() => {
    const bioByDept = new Map<string, number>();
    for (const f of bioFarms) {
      bioByDept.set(f.dept, (bioByDept.get(f.dept) ?? 0) + 1);
    }

    return Object.entries(pesticides.departments).map(([code, d]) => {
      const sauHa = sau?.departments[code] ?? 0;
      const bio = bioByDept.get(code) ?? 0;
      const perHa = sauHa > 0 ? d.total / sauHa : 0;
      // Paradox score: high pesticides/ha AND high bio count = high paradox
      const paradox = sauHa > 0 ? (perHa * Math.log10(bio + 1)) : 0;
      return {
        code,
        nom: d.nom,
        total: d.total,
        herbicide: d.herbicide,
        fongicide: d.fongicide,
        insecticide: d.insecticide,
        autres: d.autres,
        bio,
        sauHa,
        perHa: Math.round(perHa * 10) / 10,
        paradox: Math.round(paradox * 10) / 10,
      };
    });
  }, [pesticides, bioFarms, sau]);

  // National totals
  const totals = useMemo(() => {
    let totalPest = 0, totalHerb = 0, totalFong = 0, totalInsect = 0, totalAutres = 0, totalBio = 0, totalSau = 0;
    for (const d of deptStats) {
      totalPest += d.total;
      totalHerb += d.herbicide;
      totalFong += d.fongicide;
      totalInsect += d.insecticide;
      totalAutres += d.autres;
      totalBio += d.bio;
      totalSau += d.sauHa;
    }
    return { totalPest, totalHerb, totalFong, totalInsect, totalAutres, totalBio, totalSau };
  }, [deptStats]);

  if (!visible) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'classement', label: 'Classement' },
    { key: 'repartition', label: 'National' },
    { key: 'paradoxe', label: 'Paradoxe' },
  ];

  return (
    <>
      {/* Desktop */}
      <div className="glass panel-scroll pointer-events-auto absolute top-0 right-0 bottom-0 z-20 hidden w-96 overflow-y-auto border-l border-gray-200/50 pt-14 shadow-lg md:block">
        <div className="flex items-center justify-between border-b border-gray-200/50 px-4 py-2">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  tab === t.key
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <TabContent tab={tab} deptStats={deptStats} totals={totals} onDeptClick={onDeptClick} />
      </div>

      {/* Mobile */}
      <div className="glass panel-scroll pointer-events-auto absolute right-0 bottom-0 left-0 z-20 max-h-[70vh] overflow-y-auto rounded-t-2xl border-t border-gray-200/50 shadow-lg md:hidden">
        <div className="flex items-center justify-between border-b border-gray-200/50 px-4 py-2">
          <div className="flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  tab === t.key
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <TabContent tab={tab} deptStats={deptStats} totals={totals} onDeptClick={onDeptClick} />
      </div>
    </>
  );
}

interface DeptStat {
  code: string;
  nom: string;
  total: number;
  herbicide: number;
  fongicide: number;
  insecticide: number;
  autres: number;
  bio: number;
  sauHa: number;
  perHa: number;
  paradox: number;
}

function TabContent({
  tab,
  deptStats,
  totals,
  onDeptClick,
}: {
  tab: Tab;
  deptStats: DeptStat[];
  totals: { totalPest: number; totalHerb: number; totalFong: number; totalInsect: number; totalAutres: number; totalBio: number; totalSau: number };
  onDeptClick: (code: string) => void;
}) {
  if (tab === 'classement') return <ClassementTab deptStats={deptStats} onDeptClick={onDeptClick} />;
  if (tab === 'repartition') return <RepartitionTab totals={totals} deptStats={deptStats} />;
  return <ParadoxeTab deptStats={deptStats} onDeptClick={onDeptClick} />;
}

function ClassementTab({ deptStats, onDeptClick }: { deptStats: DeptStat[]; onDeptClick: (code: string) => void }) {
  const topPerHa = useMemo(() =>
    [...deptStats].filter(d => d.sauHa > 0).sort((a, b) => b.perHa - a.perHa).slice(0, 15),
  [deptStats]);

  return (
    <div className="p-4">
      <h3 className="mb-1 text-sm font-semibold text-gray-800">Top 15 — Pesticides par hectare</h3>
      <p className="mb-3 text-xs text-gray-500">Quantite vendue rapportee a la surface agricole</p>
      <ResponsiveContainer width="100%" height={380}>
        <BarChart data={topPerHa} layout="vertical" margin={{ left: 0, right: 10 }}>
          <XAxis type="number" tick={{ fontSize: 10 }} />
          <YAxis
            type="category"
            dataKey="nom"
            width={90}
            tick={{ fontSize: 9 }}
            tickFormatter={(v: string) => v.length > 12 ? v.slice(0, 12) + '..' : v}
          />
          <Tooltip
            formatter={(v: number) => [`${v.toFixed(1)} kg/ha`, 'Pesticides/ha']}
            labelFormatter={(l: string) => l}
          />
          <Bar
            dataKey="perHa"
            fill="#ef4444"
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            onClick={(d: DeptStat) => onDeptClick(d.code)}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-1">
        {topPerHa.map((d, i) => (
          <button
            key={d.code}
            onClick={() => onDeptClick(d.code)}
            className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-gray-50"
          >
            <span className="w-4 text-right font-mono text-gray-400">{i + 1}</span>
            <span className="flex-1 text-left text-gray-700">{d.nom}</span>
            <span className="font-medium text-red-600">{d.perHa} kg/ha</span>
            <span className="text-emerald-600">{d.bio} bio</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function RepartitionTab({ totals, deptStats }: { totals: { totalPest: number; totalHerb: number; totalFong: number; totalInsect: number; totalAutres: number; totalBio: number; totalSau: number }; deptStats: DeptStat[] }) {
  const pieData = [
    { name: 'Herbicides', value: totals.totalHerb, color: '#f59e0b' },
    { name: 'Fongicides', value: totals.totalFong, color: '#8b5cf6' },
    { name: 'Insecticides', value: totals.totalInsect, color: '#ef4444' },
    { name: 'Autres', value: totals.totalAutres, color: '#6b7280' },
  ];

  const avgPerHa = totals.totalSau > 0 ? totals.totalPest / totals.totalSau : 0;
  const nbDepts = deptStats.length;

  return (
    <div className="p-4">
      {/* KPI cards */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-emerald-50 p-3">
          <div className="text-xl font-bold text-emerald-700">{formatNumber(totals.totalBio)}</div>
          <div className="text-[10px] text-emerald-600">Exploitations bio</div>
        </div>
        <div className="rounded-lg bg-red-50 p-3">
          <div className="text-xl font-bold text-red-700">{formatKg(totals.totalPest)}</div>
          <div className="text-[10px] text-red-600">Pesticides vendus</div>
        </div>
        <div className="rounded-lg bg-amber-50 p-3">
          <div className="text-xl font-bold text-amber-700">{avgPerHa.toFixed(1)} kg/ha</div>
          <div className="text-[10px] text-amber-600">Moyenne nationale</div>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="text-xl font-bold text-gray-700">{nbDepts}</div>
          <div className="text-[10px] text-gray-600">Departements</div>
        </div>
      </div>

      {/* Donut */}
      <h3 className="mb-2 text-sm font-semibold text-gray-800">Repartition par type</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            dataKey="value"
            paddingAngle={2}
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(v: number) => formatKg(v)} />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-3 text-xs">
        {pieData.map((d) => (
          <div key={d.name} className="flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600">{d.name}</span>
            <span className="font-medium text-gray-800">{Math.round(d.value / totals.totalPest * 100)}%</span>
          </div>
        ))}
      </div>

      {/* Factoid */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <p className="text-xs text-amber-800">
          <strong>Le chiffre cle :</strong> En moyenne, chaque hectare de terre agricole en France recoit{' '}
          <strong>{avgPerHa.toFixed(1)} kg de pesticides</strong> par an,
          soit l'equivalent de {(avgPerHa * 10000 / 1000).toFixed(0)} tonnes pour {formatNumber(totals.totalSau)} ha de SAU.
        </p>
      </div>
    </div>
  );
}

function ParadoxeTab({ deptStats, onDeptClick }: { deptStats: DeptStat[]; onDeptClick: (code: string) => void }) {
  // Scatter: bio farms (x) vs pesticides/ha (y) — shows the paradox
  const scatterData = useMemo(() =>
    deptStats
      .filter(d => d.sauHa > 0 && d.bio > 0)
      .map(d => ({
        ...d,
        x: d.bio,
        y: d.perHa,
        z: d.total,
      })),
  [deptStats]);

  // Top paradox departments: high bio AND high pesticides/ha
  const topParadox = useMemo(() => {
    const median = [...deptStats].sort((a, b) => a.perHa - b.perHa);
    const medPerHa = median[Math.floor(median.length / 2)]?.perHa ?? 0;
    return deptStats
      .filter(d => d.bio >= 500 && d.perHa > medPerHa)
      .sort((a, b) => b.paradox - a.paradox)
      .slice(0, 10);
  }, [deptStats]);

  return (
    <div className="p-4">
      <h3 className="mb-1 text-sm font-semibold text-gray-800">Le paradoxe bio</h3>
      <p className="mb-3 text-xs text-gray-500">
        Des departements avec beaucoup de bio... baignent dans les pesticides
      </p>

      {/* Scatter plot */}
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart margin={{ left: 0, right: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            dataKey="x"
            name="Fermes bio"
            tick={{ fontSize: 9 }}
            label={{ value: 'Fermes bio', position: 'bottom', fontSize: 10, fill: '#059669' }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="kg/ha"
            tick={{ fontSize: 9 }}
            label={{ value: 'kg/ha', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#ef4444' }}
          />
          <ZAxis type="number" dataKey="z" range={[30, 200]} />
          <Tooltip
            content={({ payload }) => {
              if (!payload?.[0]) return null;
              const d = payload[0].payload as DeptStat;
              return (
                <div className="rounded bg-white p-2 text-xs shadow-lg border border-gray-200">
                  <div className="font-semibold">{d.nom} ({d.code})</div>
                  <div className="text-emerald-600">{d.bio} fermes bio</div>
                  <div className="text-red-600">{d.perHa} kg/ha pesticides</div>
                  <div className="text-gray-500">{formatKg(d.total)} total</div>
                </div>
              );
            }}
          />
          <Scatter
            data={scatterData}
            fill="#8b5cf6"
            fillOpacity={0.6}
            cursor="pointer"
            onClick={(d: DeptStat) => onDeptClick(d.code)}
          />
        </ScatterChart>
      </ResponsiveContainer>

      {/* Interpretation */}
      <div className="mt-3 rounded-lg border border-purple-200 bg-purple-50 p-3">
        <p className="text-xs text-purple-800">
          <strong>En haut a droite = paradoxe maximum :</strong> beaucoup de fermes bio,
          mais une intensite de pesticides elevee. Le bio cohabite avec une agriculture
          conventionnelle intensive dans le meme departement.
        </p>
      </div>

      {/* Top paradox list */}
      {topParadox.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold text-gray-700">Departements les plus paradoxaux</h4>
          <div className="space-y-1">
            {topParadox.map((d, i) => (
              <button
                key={d.code}
                onClick={() => onDeptClick(d.code)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-purple-50"
              >
                <span className="w-4 text-right font-mono text-gray-400">{i + 1}</span>
                <span className="flex-1 text-left text-gray-700">{d.nom}</span>
                <span className="text-emerald-600">{formatNumber(d.bio)} bio</span>
                <span className="text-red-600">{d.perHa} kg/ha</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
