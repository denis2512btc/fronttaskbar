export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  columnId: string
  boardId: string
  title: string
  description: string | null
  priority: TaskPriority
  order: number
  dueDate: string | null
  assigneeId: string | null
  createdAt: string
  updatedAt: string
}
