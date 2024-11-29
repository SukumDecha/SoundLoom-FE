'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { IComponentProps } from '../types'
import { useSocketStore } from '../stores/socket.store'

/* eslint-disable no-use-before-define */
class SocketClient {
  private static instance: SocketClient | null = null

  public socket: Socket | null = null

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) SocketClient.instance = new SocketClient()

    return SocketClient.instance
  }

  connect() {
    if (!this.socket) {
      this.socket = io('http://localhost:4001/rooms', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      this.socket.on('connect', () => {
        console.log('Socket connected')
      })

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected')
      })
    }
    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }
}

const SocketProvider = ({ children }: IComponentProps) => {
  const [socketClient] = useState(() => SocketClient.getInstance())
  const setSocket = useSocketStore((state) => state.setSocket)

  useEffect(() => {
    const socket = socketClient.connect()
    setSocket(socket)

    return () => socketClient.disconnect()
  }, [socketClient])

  return <div>{children}</div>
}

export default SocketProvider
