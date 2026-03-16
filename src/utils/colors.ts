/**
 * Choropleth color scale for pesticide usage.
 * Goes from light green (low) to dark red (high).
 */
const SCALE = [
  '#d1fae5', // very low — emerald-100
  '#a7f3d0', // low — emerald-200
  '#fde68a', // medium-low — amber-200
  '#fbbf24', // medium — amber-400
  '#f97316', // medium-high — orange-500
  '#ef4444', // high — red-500
  '#b91c1c', // very high — red-700
  '#7f1d1d', // extreme — red-900
];

/**
 * Returns a color from the scale based on the value relative to min/max.
 * Uses quantile-like breaks for better visual distribution.
 */
export function getPesticideColor(value: number, max: number): string {
  if (value <= 0) return '#f3f4f6'; // gray-100 for no data
  // Use square root scale for better distribution (heavy right skew)
  const ratio = Math.sqrt(value) / Math.sqrt(max);
  const idx = Math.min(Math.floor(ratio * SCALE.length), SCALE.length - 1);
  return SCALE[idx];
}

/** Returns opacity for choropleth fill */
export function getPesticideOpacity(value: number, max: number): number {
  if (value <= 0) return 0.1;
  const ratio = Math.sqrt(value) / Math.sqrt(max);
  return 0.3 + ratio * 0.45;
}

export { SCALE as PESTICIDE_SCALE };