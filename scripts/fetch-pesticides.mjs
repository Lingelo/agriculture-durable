#!/usr/bin/env node

/**
 * Fetch pesticide sales data from Hub'Eau API,
 * aggregate by department and function, output to public/data/pesticides.json.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'pesticides.json');

const API_BASE = 'https://hubeau.eaufrance.fr/api/v1/vente_achat_phyto/ventes/substances';
const PAGE_SIZE = 20000;
const TARGET_YEAR = 2023;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`  Retry ${i + 1}/${retries}: ${err.message}`);
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
    }
  }
}

function classifyFunction(fonction) {
  if (!fonction) return 'autres';
  const lower = fonction.toLowerCase();
  if (lower.includes('herbicide')) return 'herbicide';
  if (lower.includes('fongicide')) return 'fongicide';
  if (lower.includes('insecticide')) return 'insecticide';
  return 'autres';
}

async function main() {
  console.log(`Fetching pesticide sales for year ${TARGET_YEAR}...`);
  mkdirSync(OUTPUT_DIR, { recursive: true });

  /** @type {Record<string, { nom: string, total: number, herbicide: number, fongicide: number, insecticide: number, autres: number, substances: Set<string> }>} */
  const departments = {};
  let page = 1;
  let totalRecords = 0;

  while (true) {
    const url = `${API_BASE}?type_territoire=Departement&annee_min=${TARGET_YEAR}&annee_max=${TARGET_YEAR}&size=${PAGE_SIZE}&page=${page}`;
    console.log(`  Page ${page} (${totalRecords} records so far)...`);

    const data = await fetchWithRetry(url);
    const records = data.data || [];

    if (records.length === 0) break;

    for (const rec of records) {
      const code = rec.code_territoire;
      if (!code) continue;

      if (!departments[code]) {
        departments[code] = {
          nom: rec.libelle_territoire || code,
          total: 0,
          herbicide: 0,
          fongicide: 0,
          insecticide: 0,
          autres: 0,
          substances: new Set(),
        };
      }

      const dept = departments[code];
      const qty = parseFloat(rec.quantite) || 0;
      const fn = classifyFunction(rec.fonction);

      dept.total += qty;
      dept[fn] += qty;
      if (rec.libelle_substance) {
        dept.substances.add(rec.libelle_substance);
      }
    }

    totalRecords += records.length;
    page++;

    // If fewer records than page size, we're done
    if (records.length < PAGE_SIZE) break;
  }

  console.log(`  Total records processed: ${totalRecords}`);
  console.log(`  Departments: ${Object.keys(departments).length}`);

  // Build output: convert Sets to counts, round numbers
  const output = {
    meta: {
      year: TARGET_YEAR,
      generatedAt: new Date().toISOString(),
    },
    departments: /** @type {Record<string, any>} */ ({}),
  };

  for (const [code, dept] of Object.entries(departments)) {
    output.departments[code] = {
      nom: dept.nom,
      total: Math.round(dept.total),
      herbicide: Math.round(dept.herbicide),
      fongicide: Math.round(dept.fongicide),
      insecticide: Math.round(dept.insecticide),
      autres: Math.round(dept.autres),
      nbSubstances: dept.substances.size,
    };
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`  Written to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
