export interface BioFarm {
  id: string;
  nom: string;
  lat: number;
  lng: number;
  ville: string;
  dept: string;
  productions: string[];
  status: string;
}

export interface DepartmentPesticides {
  nom: string;
  total: number;
  herbicide: number;
  fongicide: number;
  insecticide: number;
  autres: number;
  nbSubstances: number;
}

export interface PesticideData {
  meta: {
    year: number;
    generatedAt: string;
  };
  departments: Record<string, DepartmentPesticides>;
}

export interface SAUData {
  meta: {
    source: string;
    unit: string;
    generatedAt: string;
  };
  departments: Record<string, number>;
}

export type MapMode = 'pesticides' | 'pesticides_ha' | 'paradoxe';

export type ProductionFilter =
  | 'Toutes'
  | 'Viticulture'
  | 'Grandes cultures'
  | 'Maraichage'
  | 'Elevage'
  | 'Arboriculture';

export const PRODUCTION_FILTERS: ProductionFilter[] = [
  'Toutes',
  'Viticulture',
  'Grandes cultures',
  'Maraichage',
  'Elevage',
  'Arboriculture',
];

export const MAP_MODE_LABELS: Record<MapMode, string> = {
  pesticides: 'Pesticides (brut)',
  pesticides_ha: 'Pesticides / ha',
  paradoxe: 'Paradoxe bio',
};

/** Keywords used to match productions to filter categories */
export const PRODUCTION_KEYWORDS: Record<Exclude<ProductionFilter, 'Toutes'>, string[]> = {
  Viticulture: ['raisin', 'vigne', 'vin', 'viticulture', 'viticole'],
  'Grandes cultures': ['blé', 'orge', 'maïs', 'colza', 'tournesol', 'soja', 'céréale', 'grandes cultures', 'avoine', 'seigle', 'triticale', 'pois', 'féverole', 'lin', 'chanvre', 'betterave'],
  Maraichage: ['légume', 'maraîch', 'tomate', 'salade', 'carotte', 'pomme de terre', 'oignon', 'courgette', 'haricot', 'poireau', 'chou', 'concombre', 'aubergine', 'poivron', 'melon', 'fraise'],
  Elevage: ['bovin', 'ovin', 'caprin', 'porcin', 'volaille', 'lait', 'viande', 'élevage', 'vache', 'mouton', 'chèvre', 'poule', 'oeuf', 'apicult', 'miel', 'abeille'],
  Arboriculture: ['pomme', 'poire', 'pêche', 'cerise', 'prune', 'abricot', 'noix', 'noisette', 'châtaigne', 'olive', 'agrume', 'kiwi', 'arboricult', 'fruit'],
};
