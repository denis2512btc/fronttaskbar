import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Loader2, Plus, MoreHorizontal, ChevronLeft, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import {
  useBoardMembersQuery,
  useOwnerProfileQuery,
} from '@/features/boards/hooks/use-boards-queries'
import {
  useBoardColumnsQuery,
  useBoardTasksQuery,
  useCreateBoardColumnMutation,
  useCreateBoardTaskMutation,
  useDeleteBoardTaskMutation,
  useReorderKanbanTasksMutation,
  useUpdateBoardColumnMutation,
  useUpdateBoardTaskMutation,
} from '@/features/boards/hooks/use-board-kanban-queries'
import { boardGradientFromId } from '@/features/boards/utils/board-accent'
import { ColumnEditorDialog } from '@/features/columns/components/ColumnEditorDialog'
import { ColumnDeleteConfirmDialog } from '@/features/columns/components/ColumnDeleteConfirmDialog'
import type { ColumnEditorFormInput } from '@/features/columns/validations/column-editor'
import type { KanbanColumnFromApi } from '@/features/columns/api/columns-api'
import {
  kanbanColumnDroppableId,
  parseKanbanColumnDroppableId,
  type KanbanTaskFromApi,
} from '@/features/tasks/api/tasks-api'
import {
  TaskCardDialog,
  type TaskCardDraft,
  type TaskAssigneeOption,
} from '@/features/tasks/components/TaskCardDialog'
import { TASK_CARD_LEFT_BORDER } from '@/features/tasks/constants/task-card-accent'

type KanbanColumnWithTasks = KanbanColumnFromApi & { tasks: KanbanTaskFromApi[] }

type AssigneePreview = {
  label: string
  initials: string
  gradientSuffix: string
}

function cloneColumnItems(src: Record<string, string[]>): Record<string, string[]> {
  return Object.fromEntries(Object.entries(src).map(([k, v]) => [k, [...v]]))
}

function buildColumnItemsFromKanban(columns: KanbanColumnWithTasks[]): Record<string, string[]> {
  const o: Record<string, string[]> = {}
  for (const c of columns) {
    o[c.id] = c.tasks.slice().sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt)).map((t) => t.id)
  }
  return o
}

function findColumnContainingTask(
  taskId: string,
  items: Record<string, string[]>,
): string | undefined {
  for (const [columnId, ids] of Object.entries(items)) {
    if (ids.includes(taskId)) return columnId
  }
  return undefined
}

function getChangedColumnSyncs(
  before: Record<string, string[]>,
  after: Record<string, string[]>,
  columnIds: string[],
): { columnId: string; orderedTaskIds: string[] }[] {
  const out: { columnId: string; orderedTaskIds: string[] }[] = []
  for (const cid of columnIds) {
    const b = before[cid] ?? []
    const a = after[cid] ?? []
    const changed = b.length !== a.length || b.some((id, i) => id !== a[i])
    if (changed) {
      out.push({ columnId: cid, orderedTaskIds: a })
    }
  }
  return out
}

function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  if (parts.length === 1 && parts[0].length === 1) {
    return `${parts[0].toUpperCase()}?`
  }
  return '?'
}

function TaskCard({
  task,
  assigneePreview,
  onOpenEdit,
}: {
  task: KanbanTaskFromApi
  assigneePreview: AssigneePreview | null
  onOpenEdit: () => void
}) {
  const leftBorder = TASK_CARD_LEFT_BORDER[task.color]

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpenEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenEdit()
        }
      }}
      className={cn(
        'group w-full cursor-pointer rounded-xl border border-border/60 border-l-4 bg-card p-3.5 pl-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        leftBorder,
      )}
    >
      <p className="text-sm font-medium leading-snug text-foreground">{task.title}</p>
      {task.description.length > 0 && (
        <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-muted-foreground">
          {task.description}
        </p>
      )}
      <div className="mt-3 flex items-center justify-end gap-2">
        {assigneePreview ? (
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full border border-card bg-gradient-to-br text-[9px] font-bold text-white',
                assigneePreview.gradientSuffix,
              )}
              title={assigneePreview.label}
            >
              {assigneePreview.initials}
            </span>
            <span className="max-w-[120px] truncate text-[11px] text-muted-foreground">
              {assigneePreview.label}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground">Без ответственного</span>
        )}
      </div>
    </div>
  )
}

function KanbanSortableCard({
  task,
  assigneePreview,
  onOpenEdit,
}: {
  task: KanbanTaskFromApi
  assigneePreview: AssigneePreview | null
  onOpenEdit: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  })
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : undefined,
    zIndex: isDragging ? 1 : undefined,
    position: isDragging ? ('relative' as const) : undefined,
  }

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={dragStyle}>
      <TaskCard task={task} assigneePreview={assigneePreview} onOpenEdit={onOpenEdit} />
    </div>
  )
}

function KanbanColumnBody({
  columnId,
  children,
}: {
  columnId: string
  children: ReactNode
}) {
  const { setNodeRef } = useDroppable({ id: kanbanColumnDroppableId(columnId) })
  return (
    <div ref={setNodeRef} className="flex min-h-[120px] flex-col gap-2.5">
      {children}
    </div>
  )
}

export function BoardKanbanView({
  boardId,
  boardTitle,
  boardOwnerId,
}: {
  boardId: string
  boardTitle: string
  boardOwnerId: string
}) {
  const columnsQuery = useBoardColumnsQuery(boardId)
  const tasksQuery = useBoardTasksQuery(boardId)
  const { data: members } = useBoardMembersQuery(boardId, true)
  const { data: ownerProfile } = useOwnerProfileQuery(boardOwnerId, true)

  const createColumn = useCreateBoardColumnMutation(boardId)
  const updateColumn = useUpdateBoardColumnMutation(boardId)
  const createTask = useCreateBoardTaskMutation(boardId)
  const updateTask = useUpdateBoardTaskMutation(boardId)
  const deleteTask = useDeleteBoardTaskMutation(boardId)
  const reorderTasks = useReorderKanbanTasksMutation(boardId)

  const [columnEditorOpen, setColumnEditorOpen] = useState(false)
  const [columnEditorMode, setColumnEditorMode] = useState<'create' | 'edit'>('create')
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)

  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [taskDialogMode, setTaskDialogMode] = useState<'create' | 'edit'>('create')
  const [taskDialogColumnId, setTaskDialogColumnId] = useState<string | null>(null)
  const [taskDialogTaskId, setTaskDialogTaskId] = useState<string | null>(null)
  const [taskDialogInitial, setTaskDialogInitial] = useState<TaskCardDraft | null>(null)

  const [actionError, setActionError] = useState<string | null>(null)
  const [optimisticColumnItems, setOptimisticColumnItems] = useState<Record<
    string,
    string[]
  > | null>(null)
  const [activeDragTaskId, setActiveDragTaskId] = useState<string | null>(null)
  const dragSnapshotRef = useRef<Record<string, string[]> | null>(null)
  const [columnMenuOpenId, setColumnMenuOpenId] = useState<string | null>(null)
  const [pendingDeleteColumn, setPendingDeleteColumn] = useState<{
    id: string
    title: string
    taskCount: number
  } | null>(null)

  const assigneeOptions: TaskAssigneeOption[] = useMemo(() => {
    const opts: TaskAssigneeOption[] = []
    const ownerLabel =
      ownerProfile?.display_name?.trim() || ownerProfile?.email?.trim() || 'Владелец'
    opts.push({ value: boardOwnerId, label: ownerLabel })
    for (const m of members ?? []) {
      if (m.user_id === boardOwnerId) continue
      const p = m.profiles
      const label = p?.display_name?.trim() || p?.email?.trim() || m.user_id
      opts.push({ value: m.user_id, label })
    }
    return opts
  }, [boardOwnerId, ownerProfile, members])

  const assigneePreviewById = useMemo(() => {
    const map = new Map<string, AssigneePreview>()
    const put = (userId: string, labelRaw: string) => {
      const label = labelRaw.trim() || 'Участник'
      map.set(userId, {
        label,
        initials: initialsFromLabel(label),
        gradientSuffix: boardGradientFromId(userId),
      })
    }
    put(boardOwnerId, ownerProfile?.display_name || ownerProfile?.email || 'Владелец')
    for (const m of members ?? []) {
      const p = m.profiles
      put(m.user_id, p?.display_name || p?.email || m.user_id)
    }
    return map
  }, [boardOwnerId, ownerProfile, members])

  const columnsWithTasks: KanbanColumnWithTasks[] = useMemo(() => {
    const cols = columnsQuery.data ?? []
    const tasks = tasksQuery.data ?? []
    const tasksByCol = new Map<string, KanbanTaskFromApi[]>()
    for (const t of tasks) {
      const list = tasksByCol.get(t.columnId) ?? []
      list.push(t)
      tasksByCol.set(t.columnId, list)
    }
    return cols.map((col) => ({
      ...col,
      tasks: (tasksByCol.get(col.id) ?? []).slice().sort((a, b) => {
        if (a.position !== b.position) return a.position - b.position
        return a.createdAt.localeCompare(b.createdAt)
      }),
    }))
  }, [columnsQuery.data, tasksQuery.data])

  const tasksById = useMemo(() => {
    const m = new Map<string, KanbanTaskFromApi>()
    for (const t of tasksQuery.data ?? []) m.set(t.id, t)
    return m
  }, [tasksQuery.data])

  const serverColumnItems = useMemo(
    () => buildColumnItemsFromKanban(columnsWithTasks),
    [columnsWithTasks],
  )

  const displayColumnItems = optimisticColumnItems ?? serverColumnItems

  const itemsRef = useRef(displayColumnItems)
  useEffect(() => {
    itemsRef.current = displayColumnItems
  }, [displayColumnItems])

  const headerMembers = useMemo(() => {
    const list: { userId: string; label: string }[] = [
      {
        userId: boardOwnerId,
        label:
          ownerProfile?.display_name?.trim() || ownerProfile?.email?.trim() || 'Владелец',
      },
    ]
    for (const m of members ?? []) {
      if (m.user_id === boardOwnerId) continue
      const p = m.profiles
      list.push({
        userId: m.user_id,
        label: p?.display_name?.trim() || p?.email?.trim() || m.user_id,
      })
    }
    return list.slice(0, 4)
  }, [boardOwnerId, ownerProfile, members])

  const editingColumn = editingColumnId
    ? columnsWithTasks.find((c) => c.id === editingColumnId)
    : undefined

  const kanbanLoading = columnsQuery.isPending || tasksQuery.isPending
  const kanbanError =
    columnsQuery.isError || tasksQuery.isError
      ? columnsQuery.error?.message || tasksQuery.error?.message || 'Ошибка загрузки канбана'
      : null

  const columnIdsOrdered = useMemo(() => columnsWithTasks.map((c) => c.id), [columnsWithTasks])

  useEffect(() => {
    if (columnMenuOpenId === null) return
    const handle = (e: PointerEvent) => {
      const el = e.target as HTMLElement | null
      if (!el) return
      const root = el.closest('[data-column-menu-root]') as HTMLElement | null
      const id = root?.dataset.columnId ?? null
      if (id === columnMenuOpenId) return
      setColumnMenuOpenId(null)
    }
    document.addEventListener('pointerdown', handle, true)
    return () => document.removeEventListener('pointerdown', handle, true)
  }, [columnMenuOpenId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    dragSnapshotRef.current = cloneColumnItems(itemsRef.current)
    setActiveDragTaskId(String(event.active.id))
  }

  const handleDragCancel = () => {
    dragSnapshotRef.current = null
    setActiveDragTaskId(null)
    setOptimisticColumnItems(null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    const activeDragId = String(active.id)
    setActiveDragTaskId(null)

    const before = dragSnapshotRef.current
    dragSnapshotRef.current = null
    if (!before) return

    if (!over) {
      setOptimisticColumnItems(null)
      return
    }

    const overId = String(over.id)

    const after = cloneColumnItems(before)

    const activeColumn = findColumnContainingTask(activeDragId, after)
    const overColumn =
      findColumnContainingTask(overId, after) ?? parseKanbanColumnDroppableId(overId) ?? undefined

    if (
      activeColumn === undefined ||
      overColumn === undefined ||
      !columnIdsOrdered.includes(activeColumn) ||
      !columnIdsOrdered.includes(overColumn)
    ) {
      setOptimisticColumnItems(null)
      return
    }

    if (activeColumn === overColumn) {
      const list = [...after[activeColumn]]
      const oldIndex = list.indexOf(activeDragId)
      if (oldIndex === -1) {
        setOptimisticColumnItems(null)
        return
      }

      const droppedOnColumnZone = parseKanbanColumnDroppableId(overId) === activeColumn

      if (droppedOnColumnZone) {
        if (oldIndex !== list.length - 1) {
          list.splice(oldIndex, 1)
          list.push(activeDragId)
          after[activeColumn] = list
        }
      } else {
        const newIndex = list.indexOf(overId)
        if (newIndex === -1) {
          setOptimisticColumnItems(null)
          return
        }
        if (oldIndex === newIndex) {
          return
        }
        after[activeColumn] = arrayMove(list, oldIndex, newIndex)
      }
    } else {
      const fromList = [...after[activeColumn]]
      const toList = [...after[overColumn]]
      const fromIdx = fromList.indexOf(activeDragId)
      if (fromIdx === -1) {
        setOptimisticColumnItems(null)
        return
      }
      fromList.splice(fromIdx, 1)

      let insertIdx: number
      if (parseKanbanColumnDroppableId(overId) === overColumn) {
        insertIdx = toList.length
      } else {
        insertIdx = toList.indexOf(overId)
        if (insertIdx === -1) insertIdx = toList.length
      }
      toList.splice(insertIdx, 0, activeDragId)
      after[activeColumn] = fromList
      after[overColumn] = toList
    }

    const syncs = getChangedColumnSyncs(before, after, columnIdsOrdered)
    if (syncs.length === 0) return

    setOptimisticColumnItems(after)

    const tasksByIdFrozen = new Map(tasksById)

    try {
      setActionError(null)
      await reorderTasks.mutateAsync({
        tasksById: tasksByIdFrozen,
        columnSyncs: syncs,
      })
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : 'Не удалось сохранить порядок',
      )
    } finally {
      setOptimisticColumnItems(null)
    }
  }

  const openCreateColumn = () => {
    setActionError(null)
    setColumnEditorMode('create')
    setEditingColumnId(null)
    setColumnEditorOpen(true)
  }

  const openEditColumn = (columnId: string) => {
    setActionError(null)
    setColumnEditorMode('edit')
    setEditingColumnId(columnId)
    setColumnEditorOpen(true)
  }

  const handleColumnDeleted = (deletedColumnId: string) => {
    if (taskDialogColumnId === deletedColumnId) {
      setTaskDialogOpen(false)
      setTaskDialogColumnId(null)
      setTaskDialogTaskId(null)
      setTaskDialogInitial(null)
    }
    setOptimisticColumnItems(null)
  }

  const openTaskCreate = (columnId: string) => {
    setActionError(null)
    setTaskDialogMode('create')
    setTaskDialogColumnId(columnId)
    setTaskDialogTaskId(null)
    setTaskDialogInitial(null)
    setTaskDialogOpen(true)
  }

  const openTaskEdit = (columnId: string, task: KanbanTaskFromApi) => {
    setActionError(null)
    setTaskDialogMode('edit')
    setTaskDialogColumnId(findColumnContainingTask(task.id, displayColumnItems) ?? columnId)
    setTaskDialogTaskId(task.id)
    setTaskDialogInitial({
      title: task.title,
      description: task.description,
      color: task.color,
      assigneeId: task.assigneeId,
    })
    setTaskDialogOpen(true)
  }

  const handleColumnEditorSubmit = async (data: ColumnEditorFormInput) => {
    setActionError(null)
    const title = data.title.trim()
    try {
      if (columnEditorMode === 'create') {
        await createColumn.mutateAsync({ title, color: data.color })
      } else if (editingColumnId) {
        await updateColumn.mutateAsync({ id: editingColumnId, title, color: data.color })
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Не удалось сохранить колонку')
      throw e
    }
  }

  const handleTaskDialogSubmit = async (data: TaskCardDraft) => {
    setActionError(null)
    try {
      if (taskDialogMode === 'create' && taskDialogColumnId) {
        await createTask.mutateAsync({
          columnId: taskDialogColumnId,
          title: data.title,
          description: data.description,
          color: data.color,
          assigneeId: data.assigneeId,
        })
        return
      }
      if (taskDialogMode === 'edit' && taskDialogTaskId) {
        await updateTask.mutateAsync({
          id: taskDialogTaskId,
          title: data.title,
          description: data.description,
          color: data.color,
          assigneeId: data.assigneeId,
        })
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Не удалось сохранить карточку')
      throw e
    }
  }

  const activeDragTask =
    activeDragTaskId !== null ? tasksById.get(activeDragTaskId) ?? null : null

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/60 px-6 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Доски
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <h1 className="text-sm font-semibold">{boardTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {headerMembers.map((m) => (
              <span
                key={m.userId}
                title={m.label}
                className={cn(
                  'flex size-7 items-center justify-center rounded-full border-2 border-background bg-gradient-to-br text-[10px] font-bold text-white',
                  boardGradientFromId(m.userId),
                )}
              >
                {initialsFromLabel(m.label)}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <Plus className="size-3.5" />
            Участник
          </button>
          <button
            type="button"
            className="flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted"
          >
            <MoreHorizontal className="size-4" />
          </button>
        </div>
      </div>

      {actionError && (
        <div className="border-b border-destructive/30 bg-destructive/10 px-6 py-2 text-center text-xs text-destructive">
          {actionError}
        </div>
      )}

      <div className="relative flex flex-1 flex-col overflow-hidden">
        {kanbanLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm">
            <Loader2
              className="size-8 animate-spin text-indigo-600 dark:text-indigo-400"
              aria-hidden
            />
            <p className="text-sm text-muted-foreground">Загрузка канбана…</p>
          </div>
        )}
        {kanbanError && !kanbanLoading && (
          <div className="flex flex-1 items-center justify-center p-6">
            <p className="max-w-md text-center text-sm text-destructive">{kanbanError}</p>
          </div>
        )}
        {!kanbanError && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragCancel={handleDragCancel}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-1 gap-4 overflow-x-auto p-6">
              {columnsWithTasks.map((col) => {
                const ids = displayColumnItems[col.id] ?? []
                return (
                  <div key={col.id} className="group flex w-72 shrink-0 flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn('size-2.5 rounded-full', col.color)} />
                        <span className="text-sm font-semibold">{col.title}</span>
                        <span className="flex size-5 items-center justify-center rounded-md bg-muted text-[11px] font-medium text-muted-foreground">
                          {ids.length}
                        </span>
                      </div>
                      <div
                        className="relative text-right"
                        data-column-menu-root
                        data-column-id={col.id}
                      >
                        <button
                          type="button"
                          aria-label="Действия с колонкой"
                          aria-expanded={columnMenuOpenId === col.id}
                          onClick={() =>
                            setColumnMenuOpenId((m) => (m === col.id ? null : col.id))
                          }
                          className={cn(
                            'inline-flex size-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition hover:bg-muted group-hover:opacity-100 hover:opacity-100',
                            columnMenuOpenId === col.id && 'opacity-100',
                          )}
                        >
                          <MoreHorizontal className="size-3.5" />
                        </button>
                        {columnMenuOpenId === col.id ?
                          <div
                            role="menu"
                            className="absolute right-0 top-full z-[100] mt-1 w-48 overflow-hidden rounded-xl border border-border/60 bg-popover py-1 text-left shadow-md ring-1 ring-black/5 dark:ring-white/10"
                          >
                            <button
                              type="button"
                              role="menuitem"
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted"
                              onClick={() => {
                                setColumnMenuOpenId(null)
                                openEditColumn(col.id)
                              }}
                            >
                              <Pencil className="size-3.5 shrink-0 opacity-70" aria-hidden />
                              Редактировать
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                              onClick={() => {
                                setColumnMenuOpenId(null)
                                setPendingDeleteColumn({
                                  id: col.id,
                                  title: col.title,
                                  taskCount: ids.length,
                                })
                              }}
                            >
                              <Trash2 className="size-3.5 shrink-0 opacity-70" aria-hidden />
                              Удалить…
                            </button>
                          </div>
                        : null}
                      </div>
                    </div>

                    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                      <KanbanColumnBody columnId={col.id}>
                        {ids.map((taskId) => {
                          const task = tasksById.get(taskId)
                          if (!task) return null
                          const assigneePreview =
                            task.assigneeId ?
                              assigneePreviewById.get(task.assigneeId) ?? {
                                label: 'Участник',
                                initials: '?',
                                gradientSuffix: boardGradientFromId(task.assigneeId),
                              }
                            : null
                          return (
                            <KanbanSortableCard
                              key={task.id}
                              task={task}
                              assigneePreview={assigneePreview}
                              onOpenEdit={() => openTaskEdit(col.id, task)}
                            />
                          )
                        })}
                      </KanbanColumnBody>
                    </SortableContext>

                    <button
                      type="button"
                      onClick={() => openTaskCreate(col.id)}
                      className="flex items-center gap-2 rounded-xl border border-dashed border-border/60 px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-indigo-400 hover:bg-indigo-50/40 hover:text-indigo-600 dark:hover:bg-indigo-950/20 dark:hover:text-indigo-400"
                    >
                      <Plus className="size-4" />
                      Создать карточку
                    </button>
                  </div>
                )
              })}

              <button
                type="button"
                onClick={openCreateColumn}
                className="flex h-fit w-72 shrink-0 items-center gap-2 rounded-xl border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <Plus className="size-4" />
                Добавить колонку
              </button>
            </div>

            <DragOverlay>
              {activeDragTask ?
                <div className="w-72 rounded-xl opacity-95 shadow-xl ring-2 ring-indigo-500/30">
                  <TaskCard
                    task={activeDragTask}
                    assigneePreview={
                      activeDragTask.assigneeId ?
                        assigneePreviewById.get(activeDragTask.assigneeId) ?? {
                          label: 'Участник',
                          initials: '?',
                          gradientSuffix: boardGradientFromId(activeDragTask.assigneeId),
                        }
                      : null
                    }
                    onOpenEdit={() => undefined}
                  />
                </div>
              : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <ColumnEditorDialog
        open={columnEditorOpen}
        onOpenChange={setColumnEditorOpen}
        mode={columnEditorMode}
        initial={
          columnEditorMode === 'edit' && editingColumn
            ? { title: editingColumn.title, color: editingColumn.color }
            : undefined
        }
        onSubmit={handleColumnEditorSubmit}
      />

      <ColumnDeleteConfirmDialog
        boardId={boardId}
        open={pendingDeleteColumn !== null}
        onOpenChange={(next) => {
          if (!next) setPendingDeleteColumn(null)
        }}
        columnId={pendingDeleteColumn?.id ?? ''}
        columnTitle={pendingDeleteColumn?.title ?? ''}
        taskCount={pendingDeleteColumn?.taskCount ?? 0}
        onDeleted={handleColumnDeleted}
      />

      <TaskCardDialog
        mode={taskDialogMode}
        open={taskDialogOpen}
        assigneeOptions={assigneeOptions}
        onOpenChange={(open) => {
          setTaskDialogOpen(open)
          if (!open) {
            setTaskDialogColumnId(null)
            setTaskDialogTaskId(null)
            setTaskDialogInitial(null)
          }
        }}
        initial={taskDialogMode === 'edit' ? taskDialogInitial ?? undefined : undefined}
        onSubmit={handleTaskDialogSubmit}
        onDeleteTask={
          taskDialogMode === 'edit' && taskDialogTaskId
            ? async () => {
                setActionError(null)
                try {
                  await deleteTask.mutateAsync(taskDialogTaskId)
                } catch (e) {
                  setActionError(
                    e instanceof Error ? e.message : 'Не удалось удалить карточку',
                  )
                  throw e
                }
              }
            : undefined
        }
      />
    </div>
  )
}
