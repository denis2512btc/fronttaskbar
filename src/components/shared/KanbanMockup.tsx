const COLUMNS = [
  {
    title: 'To Do',
    count: 4,
    cards: [
      { title: 'Design onboarding flow', tags: ['Design'], avatars: 2 },
    ],
  },
  {
    title: 'In progress',
    count: 3,
    cards: [
      { title: 'Build landing page sections', tags: ['Frontend', 'AI'], avatars: 1 },
    ],
  },
  {
    title: 'Done',
    count: 5,
    cards: [
      { title: 'Set up CI/CD pipeline', tags: ['DevOps'], avatars: 2 },
    ],
  },
]

const TAG_COLORS: Record<string, string> = {
  Design: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Frontend: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  AI: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  DevOps: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
}

export function KanbanMockup() {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl shadow-indigo-500/10">
      {/* Window chrome */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-2.5">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-red-400" />
          <span className="size-3 rounded-full bg-yellow-400" />
          <span className="size-3 rounded-full bg-green-400" />
        </div>
        <div className="flex-1 mx-4">
          <div className="mx-auto flex h-6 max-w-[200px] items-center justify-center rounded-md bg-muted/60 text-[11px] text-muted-foreground">
            app.aitaskboard.io/board
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {['bg-indigo-400', 'bg-violet-400', 'bg-blue-400'].map((c, i) => (
            <span key={i} className={`size-6 rounded-full border-2 border-background ${c}`} />
          ))}
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {COLUMNS.map((col) => (
          <div key={col.title} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">{col.title}</span>
              <span className="flex size-4 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                {col.count}
              </span>
            </div>
            {col.cards.map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-border/60 bg-card p-3 shadow-sm"
              >
                <div className="flex flex-wrap gap-1 mb-2">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-medium ${TAG_COLORS[tag] ?? ''}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-medium leading-snug text-foreground">{card.title}</p>
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: card.avatars }).map((_, i) => (
                    <span
                      key={i}
                      className="flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-[8px] font-bold text-white"
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <button className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] text-muted-foreground hover:bg-muted/60 transition-colors">
              <span className="text-base leading-none">+</span> Добавить
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
