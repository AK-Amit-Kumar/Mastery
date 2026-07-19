// Deterministic accent color per skill, so same-tier badges aren't visually identical.
const ACCENT_PALETTE = ['#4deeea', '#f92aad', '#7dff6b', '#ffd23f', '#ff9d3f', '#c04dff', '#ff4d4d', '#3fa9ff']

export function seedColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  }
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length]
}
