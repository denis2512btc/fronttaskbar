export interface MockAssignee {
  id: string
  displayName: string
  initials: string
  avatarClass: string
}

/** Выбор пользователя только для UI (не из БД). */
export const MOCK_ASSIGNEE_ID_LIST = [
  'mock-user-1',
  'mock-user-2',
  'mock-user-3',
  'mock-user-4',
] as const

export type MockAssigneeId = (typeof MOCK_ASSIGNEE_ID_LIST)[number]

export const MOCK_BOARD_ASSIGNEES: MockAssignee[] = [
  {
    id: 'mock-user-1',
    displayName: 'Анна Кузнецова',
    initials: 'АК',
    avatarClass: 'bg-gradient-to-br from-indigo-400 to-violet-500',
  },
  {
    id: 'mock-user-2',
    displayName: 'Илья Новиков',
    initials: 'ИН',
    avatarClass: 'bg-gradient-to-br from-blue-400 to-indigo-500',
  },
  {
    id: 'mock-user-3',
    displayName: 'Мария Соколова',
    initials: 'МС',
    avatarClass: 'bg-gradient-to-br from-violet-400 to-purple-500',
  },
  {
    id: 'mock-user-4',
    displayName: 'Дмитрий Орлов',
    initials: 'ДО',
    avatarClass: 'bg-gradient-to-br from-sky-400 to-cyan-500',
  },
]

export const MOCK_ASSIGNEE_IDS = MOCK_ASSIGNEE_ID_LIST
