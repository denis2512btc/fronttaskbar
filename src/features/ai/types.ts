export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AISuggestion {
  id: string
  taskId: string
  content: string
  createdAt: string
}
