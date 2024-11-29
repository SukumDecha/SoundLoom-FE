import { ConfigProvider, notification } from 'antd'
import { useEffect, useMemo } from 'react'
import {
  NotificationPayload,
  useNotificationStore,
} from '../stores/notification.store'

const Notification = () => {
  const [api, contextHolder] = notification.useNotification()
  const state = useNotificationStore((state) => state.notification)

  const openNotification = (payload: NotificationPayload) => {
    api[payload.type]({
      message: payload.message,
      description: payload.description,
      showProgress: payload.showProgress,
      pauseOnHover: payload.passOnHover,
    })
  }

  const theme = useMemo(() => {
    const baseColors = {
      success: {
        colorPrimary: 'rgb(82, 196, 26)',
        colorPrimaryBorder: 'rgb(135, 208, 104)',
        colorPrimaryBorderHover: 'rgb(73, 182, 20)',
      },
      info: {
        colorPrimary: 'rgb(24, 144, 255)',
        colorPrimaryBorder: 'rgb(64, 169, 255)',
        colorPrimaryBorderHover: 'rgb(20, 132, 240)',
      },
      warning: {
        colorPrimary: 'rgb(250, 173, 20)',
        colorPrimaryBorder: 'rgb(255, 202, 87)',
        colorPrimaryBorderHover: 'rgb(240, 160, 10)',
      },
      error: {
        colorPrimary: 'rgb(245, 34, 45)',
        colorPrimaryBorder: 'rgb(255, 85, 95)',
        colorPrimaryBorderHover: 'rgb(230, 30, 40)',
      },
    }

    return {
      components: {
        Notification: baseColors[state?.type || 'info'],
      },
    }
  }, [state?.type])

  useEffect(() => {
    if (state) openNotification(state)
  }, [state])

  return <ConfigProvider theme={theme}>{contextHolder}</ConfigProvider>
}

export default Notification
