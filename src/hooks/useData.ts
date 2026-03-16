import { useState, useEffect } from 'react';
import type { BioFarm, PesticideData } from '../types';
import type { FeatureCollection } from 'geojson';

const BASE = import.meta.env.BASE_URL;

interface DataState {
  bioFarms: BioFarm[];
  pesticides: PesticideData | null;
  departmentsGeo: FeatureCollection | null;
  loading: boolean;
  error: string | null;
}

export function useData(): DataState {
  const [state, setState] = useState<DataState>({
    bioFarms: [],
    pesticides: null,
    departmentsGeo: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [bioRes, pestRes, geoRes] = await Promise.all([
          fetch(`${BASE}data/bio.json`, { signal: controller.signal }),
          fetch(`${BASE}data/pesticides.json`, { signal: controller.signal }),
          fetch(`${BASE}data/departements.geojson`, { signal: controller.signal }),
        ]);

        if (!bioRes.ok || !pestRes.ok || !geoRes.ok) {
          throw new Error('Erreur lors du chargement des donnees');
        }

        const [bioFarms, pesticides, departmentsGeo] = await Promise.all([
          bioRes.json() as Promise<BioFarm[]>,
          pestRes.json() as Promise<PesticideData>,
          geoRes.json() as Promise<FeatureCollection>,
        ]);

        setState({
          bioFarms,
          pesticides,
          departmentsGeo,
          loading: false,
          error: null,
        });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setState((s) => ({
          ...s,
          loading: false,
          error: (err as Error).message,
        }));
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return state;
}
