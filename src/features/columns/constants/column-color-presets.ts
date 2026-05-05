/** Допустимые классы Tailwind для индикатора цвета колонки (канбан UI). */
export const COLUMN_COLOR_PRESET_CLASSES = [
  'bg-slate-400',
  'bg-indigo-500',
  'bg-amber-400',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-orange-500',
] as const

export type ColumnColorPreset = (typeof COLUMN_COLOR_PRESET_CLASSES)[number]
