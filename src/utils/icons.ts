// Small curated set of pixel-friendly emoji icons users can pick for a skill.
export const SKILL_ICONS = [
  '⚛', '🎸', '♟', '🐍', '🎤', '🖌', '📷', '✍',
  '🧘', '🥋', '⚔', '🏹', '🎹', '🧪', '📐', '🗣',
  '🏋', '🏃', '🍳', '💻', '🎮', '📊', '🧵', '🌐',
]

export function pickRandomIcon(): string {
  return SKILL_ICONS[Math.floor(Math.random() * SKILL_ICONS.length)]
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}
