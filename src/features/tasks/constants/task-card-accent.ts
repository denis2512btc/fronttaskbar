import type { ColumnColorPreset } from '@/features/columns/constants/column-color-presets'

/** Левая граница карточки по пресету (только Tailwind). */
export const TASK_CARD_LEFT_BORDER: Record<ColumnColorPreset, string> = {
  'bg-slate-400': 'border-l-slate-400',
  'bg-indigo-500': 'border-l-indigo-500',
  'bg-amber-400': 'border-l-amber-400',
  'bg-emerald-500': 'border-l-emerald-500',
  'bg-rose-500': 'border-l-rose-500',
  'bg-sky-500': 'border-l-sky-500',
  'bg-violet-500': 'border-l-violet-500',
  'bg-orange-500': 'border-l-orange-500',
}
