import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TaskAiSourceHintProps {
  promptText: string
  label: string
  className?: string
}

export function TaskAiSourceHint({ promptText, label, className }: TaskAiSourceHintProps) {
  return (
    <span
      className={cn('group/icon relative inline-flex shrink-0', className)}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <span
        role="img"
        aria-label={label}
        className="flex size-6 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600/90 to-violet-600/90 text-white shadow-sm"
      >
        <Sparkles className="size-3.5" aria-hidden />
      </span>
      <span
        className={cn(
          'pointer-events-none absolute left-0 top-full z-50 mt-1 hidden w-[min(18rem,calc(100vw-3rem))] max-h-52 overflow-y-auto rounded-xl border border-border/60 bg-popover p-3 text-left text-xs leading-relaxed text-popover-foreground shadow-md',
          'group-hover/icon:block',
        )}
      >
        <span className="mb-1 block font-semibold text-foreground">{label}</span>
        <span className="whitespace-pre-wrap break-words text-muted-foreground">{promptText}</span>
      </span>
    </span>
  )
}
