/** Deterministic Tailwind gradient classes for board rows (no DB column). */
const GRADIENT_CLASSES = [
  'from-indigo-500 to-violet-600',
  'from-blue-500 to-indigo-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
] as const

export function boardGradientFromId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % 1_000_000
  }
  return GRADIENT_CLASSES[Math.abs(hash) % GRADIENT_CLASSES.length]
}
