export type ThemeId = 'arcade' | 'matrix' | 'vaporwave' | 'ice'

interface ThemeOption {
  id: ThemeId
  label: string
  swatches: string[]
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'arcade',
    label: 'ARCADE',
    swatches: ['#0a0a1a', '#4deeea', '#f92aad', '#7dff6b', '#ffd23f'],
  },
  {
    id: 'matrix',
    label: 'MATRIX',
    swatches: ['#050f0a', '#39ff14', '#00e5a0', '#7dff6b', '#d4ff3f'],
  },
  {
    id: 'vaporwave',
    label: 'VAPORWAVE',
    swatches: ['#1a0a1f', '#4ce0ff', '#ff6ec7', '#ffe066', '#ff8a3f'],
  },
  {
    id: 'ice',
    label: 'ICE',
    swatches: ['#05121a', '#7de8ff', '#7a8cff', '#6bffe0', '#ffe08a'],
  },
]

export function getThemeOption(id: ThemeId): ThemeOption {
  return THEME_OPTIONS.find((t) => t.id === id) ?? THEME_OPTIONS[0]
}
