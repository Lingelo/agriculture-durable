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
 * Format pesticides per hectare.
 */
export function formatPerHa(kgTotal: number, hectares: number): string {
  if (hectares <= 0) return '--';
  const perHa = kgTotal / hectares;
  if (perHa >= 1000) return `${(perHa / 1000).toFixed(1)} t/ha`;
  return `${perHa.toFixed(1)} kg/ha`;
}

/**
 * French relative time string from ISO date.
 */
export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `il y a ${mins} minute${mins > 1 ? 's' : ''}`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
  const months = Math.floor(days / 30);
  return `il y a ${months} mois`;
}

/**
 * Format a ratio as a readable string.
 */
export function formatRatio(bioCount: number, pesticideKg: number): string {
  if (pesticideKg <= 0) return '--';
  const ratio = (bioCount / (pesticideKg / 1000)) * 100;
  return ratio.toFixed(1);
}
