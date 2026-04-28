export function HeroSection() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 bg-gradient-to-br from-indigo-600 via-violet-600 to-blue-600 px-6 text-white">
      <h1 className="max-w-3xl text-center text-5xl font-bold leading-tight">
        AI Task Board
      </h1>
      <p className="max-w-xl text-center text-lg text-white/80">
        Smart kanban boards powered by AI — organize, prioritize, and ship
        faster.
      </p>
    </section>
  )
}
