import { useState, useEffect } from 'react'
import io, { Socket } from 'socket.io-client'
import { Room, RoomSettings } from '../types'

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

export function useSocketRoom() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [room, setRoom] = useState<Room | null>(null)
  const [allRooms, setAllRooms] = useState<Room[]>([])

  useEffect(() => {
    const socketClient = SocketClient.getInstance()
    const connectedSocket = socketClient.connect()
    setSocket(connectedSocket)

    return () => {
      socketClient.disconnect()
    }
  }, [])

  const createRoom = (payload: { host: string; password?: string }) => {
    return new Promise<string>((resolve, reject) => {
      socket?.emit('createRoom', payload)
      socket?.once('roomCreated', (data) => resolve(data.roomId))
      socket?.once('error', (error) => reject(error))
    })
  }

  const deleteRoom = (roomId: string) => {
    return new Promise<void>((resolve, reject) => {
      socket?.emit('deleteRoom', roomId)
      socket?.once('roomDeleted', () => resolve())
      socket?.once('error', (error) => reject(error))
    })
  }

  const deleteAllRooms = () => {
    return new Promise<void>((resolve, reject) => {
      socket?.emit('deleteAllRooms')
      socket?.once('allRoomsDeleted', () => resolve())
      socket?.once('error', (error) => reject(error))
    })
  }

  const joinRoom = (payload: { roomId: string; password?: string }) => {
    return new Promise<Room>((resolve, reject) => {
      socket?.emit('joinRoom', payload)
      socket?.once('joinedRoom', (roomData) => {
        setRoom(roomData)
        resolve(roomData)
      })
      socket?.once('error', (error) => reject(error))
    })
  }

  const getRoomDetails = (roomId: string) => {
    return new Promise<Room>((resolve, reject) => {
      socket?.emit('getRoomDetails', roomId)
      socket?.once('roomDetails', (roomData) => {
        setRoom(roomData)
        resolve(roomData)
      })
      socket?.once('error', (error) => reject(error))
    })
  }

  const getAllRooms = () => {
    return new Promise<Room[]>((resolve, reject) => {
      socket?.emit('getAllRooms')
      socket?.once('allRooms', (rooms) => resolve(rooms))
      socket?.once('error', (error) => reject(error))
    })
  }

  const addToQueue = (roomId: string, music: any) => {
    return new Promise<Room>((resolve, reject) => {
      socket?.emit('addToQueue', { roomId, music })
      socket?.once('queueUpdated', (updatedRoom) => {
        setRoom(updatedRoom)
        resolve(updatedRoom)
      })
      socket?.once('error', (error) => reject(error))
    })
  }

  const removeFromQueue = (roomId: string, musicId: string) => {
    return new Promise<Room>((resolve, reject) => {
      socket?.emit('removeFromQueue', { roomId, musicId })
      socket?.once('queueUpdated', (updatedRoom) => {
        setRoom(updatedRoom)
        resolve(updatedRoom)
      })
      socket?.once('error', (error) => reject(error))
    })
  }

  const updateRoomSettings = (payload: {
    roomId: string
    settings: Partial<RoomSettings>
  }) => {
    return new Promise<Room>((resolve, reject) => {
      socket?.emit('updateRoomSettings', payload)
      socket?.once('roomSettingsUpdated', (updatedRoom) => {
        setRoom(updatedRoom)
        resolve(updatedRoom)
      })
      socket?.once('error', (error) => reject(error))
    })
  }

  const getNextMusic = (roomId: string) => {
    return new Promise<any>((resolve, reject) => {
      socket?.emit('getNextMusic', roomId)
      socket?.once('nextMusicReady', (nextMusic) => resolve(nextMusic))
      socket?.once('error', (error) => reject(error))
    })
  }

  const changeRoomPassword = (roomId: string, newPassword: string) => {
    return new Promise<Room>((resolve, reject) => {
      socket?.emit('changeRoomPassword', { roomId, newPassword })
      socket?.once('roomPasswordChanged', (updatedRoom) => {
        setRoom(updatedRoom)
        resolve(updatedRoom)
      })
      socket?.once('error', (error) => reject(error))
    })
  }

  // Listen for room events
  useEffect(() => {
    if (!socket) return

    const handleUserJoined = (data: any) => {
      console.log('User joined:', data.clientId)
    }

    const handleRoomUpdate = (updatedRoom: Room) => {
      setRoom(updatedRoom)
    }

    const handleRoomCreated = async () => {
      const allRooms = await getAllRooms()
      setAllRooms(allRooms)
    }

    handleRoomCreated()

    socket.on('userJoined', handleUserJoined)
    socket.on('queueUpdated', handleRoomUpdate)
    socket.on('roomSettingsUpdated', handleRoomUpdate)
    socket.on('roomCreated', handleRoomCreated)

    return () => {
      socket.off('userJoined', handleUserJoined)
      socket.off('queueUpdated', handleRoomUpdate)
      socket.off('roomSettingsUpdated', handleRoomUpdate)
      socket.off('roomCreated', handleRoomCreated)
    }
  }, [socket])

  return {
    socket,
    room,
    allRooms,
    createRoom,
    deleteRoom,
    deleteAllRooms,
    joinRoom,
    getRoomDetails,
    addToQueue,
    removeFromQueue,
    updateRoomSettings,
    getNextMusic,
    changeRoomPassword,
  }
}

export default SocketClient
