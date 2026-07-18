let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return null
    ctx = new AudioCtx()
  }
  return ctx
}

function playTone(freq: number, durationMs: number, type: OscillatorType = 'square', gain = 0.05, delayMs = 0) {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const g = audioCtx.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  osc.connect(g)
  g.connect(audioCtx.destination)
  const startAt = audioCtx.currentTime + delayMs / 1000
  osc.start(startAt)
  g.gain.setValueAtTime(gain, startAt)
  g.gain.exponentialRampToValueAtTime(0.0001, startAt + durationMs / 1000)
  osc.stop(startAt + durationMs / 1000)
}

function playSweep(fromFreq: number, toFreq: number, durationMs: number, type: OscillatorType = 'sawtooth', gain = 0.05) {
  const audioCtx = getCtx()
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const g = audioCtx.createGain()
  osc.type = type
  g.gain.value = gain
  osc.connect(g)
  g.connect(audioCtx.destination)
  const now = audioCtx.currentTime
  const durationSec = durationMs / 1000
  osc.frequency.setValueAtTime(fromFreq, now)
  osc.frequency.exponentialRampToValueAtTime(toFreq, now + durationSec)
  g.gain.setValueAtTime(gain, now)
  g.gain.exponentialRampToValueAtTime(0.0001, now + durationSec)
  osc.start(now)
  osc.stop(now + durationSec)
}

export function playBlip() {
  playTone(660, 90, 'square', 0.04)
}

// --- Click sound variants (selectable in Settings) ---

export type ClickSoundId = 'blip' | 'laser' | 'tick' | 'powerup' | 'chime'

export const CLICK_SOUND_OPTIONS: { id: ClickSoundId; label: string }[] = [
  { id: 'blip', label: 'BLIP' },
  { id: 'laser', label: 'LASER' },
  { id: 'tick', label: 'TICK' },
  { id: 'powerup', label: 'POWER-UP' },
  { id: 'chime', label: 'CHIME' },
]

function playLaserClick() {
  playSweep(1100, 140, 130, 'sawtooth', 0.045)
}

function playTickClick() {
  playTone(1800, 25, 'square', 0.035)
}

function playPowerupClick() {
  playTone(523, 55, 'square', 0.045)
  playTone(784, 80, 'square', 0.045, 50)
}

function playChimeClick() {
  playTone(880, 90, 'triangle', 0.05)
  playTone(1318, 130, 'triangle', 0.04, 40)
}

export function playClickSound(id: ClickSoundId) {
  switch (id) {
    case 'laser':
      return playLaserClick()
    case 'tick':
      return playTickClick()
    case 'powerup':
      return playPowerupClick()
    case 'chime':
      return playChimeClick()
    case 'blip':
    default:
      return playBlip()
  }
}

export function playCoin() {
  playTone(988, 80, 'square', 0.05)
  playTone(1319, 120, 'square', 0.05, 80)
}

export function playLevelUp() {
  const notes = [523, 659, 784, 1047]
  notes.forEach((f, i) => playTone(f, 140, 'square', 0.06, i * 110))
}

export function playMaster() {
  const notes = [523, 659, 784, 1047, 1319, 1568]
  notes.forEach((f, i) => playTone(f, 200, 'square', 0.07, i * 130))
}
