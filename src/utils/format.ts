/**
 * Format a number with French locale (space as thousands separator).
 */
export function formatNumber(n: number): string {
  return n.toLocaleString('fr-FR');
}

/**
 * Format kg to tonnes if large enough.
 */
export function formatKg(kg: number): string {
  if (kg >= 1_000_000) {
    return `${(kg / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} t`;
  }
  if (kg >= 1000) {
    return `${(kg / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} t`;
  }
  return `${kg.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} kg`;
}

/**
 * Format a ratio as a readable string.
 */
export function formatRatio(bioCount: number, pesticideKg: number): string {
  if (pesticideKg <= 0) return '--';
  const ratio = (bioCount / (pesticideKg / 1000)) * 100;
  return ratio.toFixed(1);
}
