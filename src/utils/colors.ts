/**
 * Choropleth color scales for different map modes.
 */

// Pesticide scale: light green → dark red
const PESTICIDE_SCALE = [
  '#d1fae5', // very low — emerald-100
  '#a7f3d0', // low — emerald-200
  '#fde68a', // medium-low — amber-200
  '#fbbf24', // medium — amber-400
  '#f97316', // medium-high — orange-500
  '#ef4444', // high — red-500
  '#b91c1c', // very high — red-700
  '#7f1d1d', // extreme — red-900
];

// Paradox scale: green (good — lots of bio, few pesticides) → purple (bad — high pesticides despite bio)
const PARADOX_SCALE = [
  '#d1fae5', // very good
  '#6ee7b7', // good
  '#fde68a', // mixed
  '#fbbf24', // concerning
  '#f97316', // bad
  '#ef4444', // very bad
  '#a855f7', // paradoxical
  '#7c3aed', // extreme paradox
];

export function getScaleColor(value: number, max: number, scale: string[]): string {
  if (value <= 0) return '#f3f4f6';
  const ratio = Math.sqrt(value) / Math.sqrt(max);
  const idx = Math.min(Math.floor(ratio * scale.length), scale.length - 1);
  return scale[idx];
}

export function getPesticideColor(value: number, max: number): string {
  return getScaleColor(value, max, PESTICIDE_SCALE);
}

export function getParadoxColor(value: number, max: number): string {
  return getScaleColor(value, max, PARADOX_SCALE);
}

export function getPesticideOpacity(value: number, max: number): number {
  if (value <= 0) return 0.1;
  const ratio = Math.sqrt(value) / Math.sqrt(max);
  return 0.3 + ratio * 0.45;
}

export { PESTICIDE_SCALE, PARADOX_SCALE };
