/** PostgREST / Postgres messages when tables were not created (empty project, no migrations). */
export function isCompetencyBackendUnavailableError(error: unknown): boolean {
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase()
  return (
    msg.includes('could not find the table') ||
    msg.includes('schema cache') ||
    (msg.includes('relation') && msg.includes('does not exist')) ||
    msg.includes('42p01')
  )
}
