'use client'

import { ConfigProvider, theme } from 'antd'
import { useEffect, useState } from 'react'
import { IComponentProps } from '../types'
import Notification from '../components/Notification'
import SocketProvider from './SocketProvider'

const { defaultAlgorithm, darkAlgorithm } = theme

const ClientProvider = ({ children }: IComponentProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDarkScheme = window.matchMedia(
        '(prefers-color-scheme: dark)'
      )
      setIsDarkMode(prefersDarkScheme.matches)

      // Add listener for changes in the preference
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches)
      }

      prefersDarkScheme.addEventListener('change', handleChange)

      return () => {
        prefersDarkScheme.removeEventListener('change', handleChange)
      }
    }
  }, [])

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <SocketProvider>
        <Notification />
        {children}
      </SocketProvider>
    </ConfigProvider>
  )
}

export default ClientProvider
