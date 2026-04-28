export interface TelegramConnection {
  userId: string
  chatId: string
  connectedAt: string
}

export interface TelegramNotification {
  id: string
  userId: string
  message: string
  sentAt: string
}
