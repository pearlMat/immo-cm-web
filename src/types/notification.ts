import type { NotificationType } from "./enums"

export interface Notification {
  id: string
  type: NotificationType
  message: string
  read: boolean
  createdAt: string
  userId: string
  listingId: string | null
}
