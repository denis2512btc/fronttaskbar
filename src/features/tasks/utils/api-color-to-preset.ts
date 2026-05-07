import {
  COLUMN_COLOR_PRESET_CLASSES,
  type ColumnColorPreset,
} from '@/features/columns/constants/column-color-presets'

/** Приблизительные RGB (Tailwind default palette) для сопоставления с hex из API. */
const PRESET_RGB: Record<ColumnColorPreset, readonly [number, number, number]> = {
  'bg-slate-400': [148, 163, 184],
  'bg-indigo-500': [99, 102, 241],
  'bg-amber-400': [251, 191, 36],
  'bg-emerald-500': [16, 185, 129],
  'bg-rose-500': [244, 63, 94],
  'bg-sky-500': [14, 165, 233],
  'bg-violet-500': [139, 92, 246],
  'bg-orange-500': [249, 115, 22],
}

const PRESET_SET = new Set<string>(COLUMN_COLOR_PRESET_CLASSES)

function parseHexRgb(value: string): [number, number, number] | null {
  const m = value.trim().match(/^#?([0-9a-f]{6})$/i)
  if (!m?.[1]) return null
  const n = Number.parseInt(m[1], 16)
  if (Number.isNaN(n)) return null
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function colorDistance2(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
): number {
  const dr = a[0] - b[0]
  const dg = a[1] - b[1]
  const db = a[2] - b[2]
  return dr * dr + dg * dg + db * db
}

/** Цвет из API (hex или уже класс пресета канбана) приводит к допустимому пресету карточки. */
export function apiColorToColumnPreset(value: string): ColumnColorPreset {
  const trimmed = value.trim()
  if (PRESET_SET.has(trimmed)) return trimmed as ColumnColorPreset

  const rgb = parseHexRgb(trimmed)
  if (rgb) {
    let best: ColumnColorPreset = COLUMN_COLOR_PRESET_CLASSES[0]
    let bestD = Number.POSITIVE_INFINITY
    for (const preset of COLUMN_COLOR_PRESET_CLASSES) {
      const d = colorDistance2(rgb, PRESET_RGB[preset])
      if (d < bestD) {
        bestD = d
        best = preset
      }
    }
    return best
  }

  return COLUMN_COLOR_PRESET_CLASSES[0]
}
