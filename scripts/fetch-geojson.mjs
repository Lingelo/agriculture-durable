#!/usr/bin/env node

/**
 * Download French department boundaries GeoJSON.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = join(OUTPUT_DIR, 'departements.geojson');

const GEOJSON_URL =
  'https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements-version-simplifiee.geojson';

async function main() {
  console.log('Downloading French departments GeoJSON...');
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const res = await fetch(GEOJSON_URL);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching GeoJSON`);
  }

  const text = await res.text();
  writeFileSync(OUTPUT_FILE, text);

  const sizeMB = (Buffer.byteLength(text) / 1024 / 1024).toFixed(1);
  console.log(`  Written to ${OUTPUT_FILE} (${sizeMB} MB)`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
