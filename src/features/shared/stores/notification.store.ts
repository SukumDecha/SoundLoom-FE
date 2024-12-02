import { create } from 'zustand'

type NotificationType = 'success' | 'info' | 'warning' | 'error'

export type NotificationPayload = {
  type: NotificationType
  message: string
  description?: string
  showProgress?: boolean
  passOnHover?: boolean
}

type NotificationStore = {
  notification: NotificationPayload | null
  openNotification: (payload: NotificationPayload) => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notification: null,
  openNotification: (payload) => {
    set({ notification: payload })
  },
}))
