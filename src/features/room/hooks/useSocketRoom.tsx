'use client'

import { useEffect } from 'react'
import { useSocketStore } from '@/features/shared/stores/socket.store'
import { Room } from '../../../types/room'
import { useRoomStore } from '../stores/room.store'
import { withTimeout } from '@/features/shared/utils/TimerUtil'
import { useNotificationStore } from '@/features/shared/stores/notification.store'


export default function useSocketRoom() {
  const socket = useSocketStore((state) => state.socket)
  const { room, setRoom, allRooms, setAllRooms, setOwnedRoomId } = useRoomStore()

  const openNotification = useNotificationStore(
    (state) => state.openNotification
  )

  // Function to initialize socket listeners
  const initializeListeners = () => {
    if (!socket) {
      console.error('Socket not initialized')
      return
    }

    const doFetchRooms = async () => {
      try {
        const allRooms = await getAllRooms()
        setAllRooms(allRooms)
      } catch (error) {
        console.error('Failed to fetch rooms:', error)
      }
    }

    const doUpdateRoom = (updatedRoom: Room) => {
      if (room?.id === updatedRoom?.id) {
        setRoom((prev) => ({ ...prev, ...updatedRoom }))
      }
      setAllRooms((rooms) =>
        rooms.map((r) => (r.id === updatedRoom?.id ? updatedRoom : r))
      )
    }

    const doRemoveRoom = (roomId: string) => {
      if (room?.id === roomId) {
        setRoom(null)
      }
      setAllRooms((rooms) => rooms.filter((r) => r.id !== roomId))
    }

    const doRemoveAllRooms = () => {
      setRoom(null)
      setAllRooms([])

      openNotification({
        type: 'warning',
        message: 'Your rooms have been deleted',
        description: 'You have been redirected to the home page',
      })

    }

    socket.on('connect', doFetchRooms)
    socket.on('newRoomCreated', doFetchRooms)
    socket.on('roomUpdated', doUpdateRoom)
    socket.on('roomDeleted', doRemoveRoom)
    socket.on('allRoomsDeleted', doRemoveAllRooms)
    socket.on('disconnect', () => {
      if (room) leaveRoom(room.id)
    })

    return () => {
      socket.off('connect', doFetchRooms)
      socket.off('newRoomCreated', doFetchRooms)
      socket.off('roomUpdated', doUpdateRoom)
      socket.off('roomDeleted', doRemoveRoom)
      socket.off('allRoomsDeleted', doRemoveAllRooms)
      socket.off('disconnect')
    }
  }

  // Core socket methods
  const createRoom = (payload: { host: string; password?: string }) => {
    return withTimeout(
      new Promise<string>((resolve, reject) => {
        socket?.emit('createRoom', payload)
        socket?.once('roomCreated', (data) => {
          setOwnedRoomId(data.roomId)
          resolve(data.roomId)
        })
        socket?.once('error', reject)
      })
    )
  }

  const deleteRoom = (roomId: string) => {
    return withTimeout(
      new Promise<void>((resolve, reject) => {
        socket?.emit('deleteRoom', roomId)
        socket?.once('roomDeleted', () => resolve())
        socket?.once('error', reject)
      })
    )
  }

  const deleteAllRooms = () => {
    return withTimeout(
      new Promise<void>((resolve, reject) => {
        socket?.emit('deleteAllRooms')
        socket?.once('allRoomsDeleted', resolve)
        socket?.once('error', reject)
      })
    )
  }

  const joinRoom = (payload: { roomId: string; password?: string }) => {
    return withTimeout(
      new Promise<Room>((resolve, reject) => {
        socket?.emit('joinRoom', payload)
        socket?.once('joinedRoom', (roomData) => {
          setRoom(roomData)
          resolve(roomData)
        })
        socket?.once('error', reject)
      })
    )
  }

  const leaveRoom = (roomId: string) => {
    return withTimeout(
      new Promise<void>((resolve, reject) => {
        socket?.emit('leaveRoom', roomId)
        socket?.once('roomLeft', () => {
          setRoom(null)
          resolve()
        })
        socket?.once('error', reject)
      })
    )
  }

  const getAllRooms = () => {
    return withTimeout(
      new Promise<Room[]>((resolve, reject) => {
        socket?.emit('getAllRooms')
        socket?.once('allRooms', resolve)
        socket?.once('error', reject)
      })
    )
  }

  const addToQueue = (roomId: string, music: any) => {
    return withTimeout(
      new Promise<Room>((resolve, reject) => {
        socket?.emit('addToQueue', { roomId, music })
        socket?.once('queueUpdated', resolve)
        socket?.once('error', reject)
      })
    )
  }

  const removeFromQueue = (roomId: string, musicId: string) => {
    return withTimeout(
      new Promise<Room>((resolve, reject) => {
        socket?.emit('removeFromQueue', { roomId, musicId })
        socket?.once('queueUpdated', resolve)
        socket?.once('error', reject)
      })
    )
  }

  const doUpdateRoom = (payload: { roomId: string; updatedRoom: Partial<Room> }) => {
    return withTimeout(
      new Promise<Room>((resolve, reject) => {
        socket?.emit('updateRoom', payload)
        socket?.once('roomUpdated', resolve)
        socket?.once('error', reject)
      })
    )
  }

  const doPlayNextMusic = (roomId: string) => {
    return withTimeout(
      new Promise<Room>((resolve, reject) => {
        socket?.emit('playNextMusic', roomId)
        socket?.once('roomUpdated', resolve)
        socket?.once('error', reject)
      })
    )
  }

  const doPlayPreviousMusic = (roomId: string) => {
    return withTimeout(
      new Promise<Room>((resolve, reject) => {
        socket?.emit('playPreviousMusic', roomId)
        socket?.once('roomUpdated', resolve)
        socket?.once('error', reject)
      })
    )
  }

  useEffect(() => {
    if (!socket) return
    const cleanup = initializeListeners()
    return cleanup
  }, [socket, room, setRoom, setAllRooms])

  return {
    socket,
    room,
    allRooms,
    createRoom,
    deleteRoom,
    deleteAllRooms,
    joinRoom,
    leaveRoom,
    addToQueue,
    removeFromQueue,
    doUpdateRoom,
    doPlayNextMusic,
    doPlayPreviousMusic,
  }
}
