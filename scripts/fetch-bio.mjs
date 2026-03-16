#!/usr/bin/env node

/**
 * Fetch organic farm operators from Agence Bio API.
 * Filters to production activities only, extracts geo-located farms,
 * and outputs a lean JSON array to public/data/bio.json.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'bio.json');

const API_BASE = 'https://opendata.agencebio.org/api/gouv/operateurs';
const PAGE_SIZE = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

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

function extractDept(codeCommune, codePostal) {
  // Code commune is 5 digits: first 2 = dept (except DOM-TOM: first 3)
  const src = codeCommune || codePostal || '';
  if (!src) return '';
  // DOM-TOM: 97x, 98x
  if (src.startsWith('97') || src.startsWith('98')) {
    return src.substring(0, 3);
  }
  // Corse: 2A, 2B
  if (src.startsWith('20') && codeCommune) {
    const num = parseInt(codeCommune, 10);
    if (num >= 20000 && num < 20200) return '2A';
    if (num >= 20200) return '2B';
  }
  return src.substring(0, 2);
}

function getBestStatus(productions) {
  // Priority: AB > C3 > C2 > C1
  const statuses = new Set();
  for (const prod of productions) {
    if (prod.etatProductions) {
      for (const etat of prod.etatProductions) {
        statuses.add(etat.etatProduction);
      }
    }
  }
  if (statuses.has('AB')) return 'AB';
  if (statuses.has('C3')) return 'C3';
  if (statuses.has('C2')) return 'C2';
  if (statuses.has('C1')) return 'C1';
  return 'AB'; // default
}

async function main() {
  console.log('Fetching organic farms from Agence Bio API...');
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const farms = [];
  let page = 0;
  let total = 0;

  while (true) {
    const url = `${API_BASE}?activite=Production&nb=${PAGE_SIZE}&debut=${page}`;
    console.log(`  Page ${page} (${farms.length} farms so far)...`);

    const data = await fetchWithRetry(url);
    const items = data.items || [];
    total = data.nbTotal || total;

    if (items.length === 0) break;

    for (const op of items) {
      const addr = op.adressesOperateurs?.[0];
      if (!addr?.lat || !addr?.long) continue;

      const lat = parseFloat(addr.lat);
      const lng = parseFloat(addr.long);
      if (isNaN(lat) || isNaN(lng)) continue;
      // Basic sanity check for France bounds (including DOM-TOM)
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) continue;

      const productions = (op.productions || [])
        .map((p) => p.nom)
        .filter(Boolean)
        .map((name) => {
          // Truncate long production names at first semicolon or comma
          const short = name.split(';')[0].split(',')[0].trim();
          return short.length > 40 ? short.substring(0, 40) : short;
        })
        // Deduplicate
        .filter((v, i, a) => a.indexOf(v) === i)
        // Limit to 5 most relevant
        .slice(0, 5);
      const dept = extractDept(addr.codeCommune, addr.codePostal);

      farms.push({
        id: String(op.numeroBio),
        nom: op.raisonSociale || '',
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        ville: addr.ville || '',
        dept,
        productions,
        status: getBestStatus(op.productions || []),
      });
    }

    page++;

    // Safety: if we've processed all known items
    if (farms.length >= total && total > 0) break;
    // Safety: API returns fewer items than page size = last page
    if (items.length < PAGE_SIZE) break;
  }

  console.log(`  Total farms with geolocation: ${farms.length}`);

  writeFileSync(OUTPUT_FILE, JSON.stringify(farms));
  const sizeMB = (Buffer.byteLength(JSON.stringify(farms)) / 1024 / 1024).toFixed(1);
  console.log(`  Written to ${OUTPUT_FILE} (${sizeMB} MB)`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
