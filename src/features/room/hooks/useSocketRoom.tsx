'use client'

import { useEffect } from 'react'
import { useSocketStore } from '@/features/shared/stores/socket.store'
import { Room } from '../../../types/room'
import { useRoomStore } from '../stores/room.store'

export default function useSocketRoom() {
  const socket = useSocketStore((state) => state.socket)
  const { room, setRoom, allRooms, setAllRooms } = useRoomStore()

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
      socket?.once('roomDeleted', (data) => {
        setRoom(null)
        resolve(data.roomId)
      })
      socket?.once('error', (error) => reject(error))
    })
  }

  const deleteAllRooms = () => {
    return new Promise<void>((resolve, reject) => {
      socket?.emit('deleteAllRooms')
      socket?.once('allRoomsDeleted', () => {
        setAllRooms([])
        resolve()
      })
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

  const leaveRoom = (roomId: string) => {
    return new Promise<void>((resolve, reject) => {
      socket?.emit('leaveRoom', roomId)
      socket?.once('roomLeft', () => {
        setRoom(null)
        resolve()
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
        setAllRooms((rooms) =>
          rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
        )
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
        setAllRooms((rooms) =>
          rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
        )
        resolve(updatedRoom)
      })
      socket?.once('error', (error) => reject(error))
    })
  }

  const updateRoom = (payload: {
    roomId: string
    settings: Partial<Room>
  }) => {
    return new Promise<Room>((resolve, reject) => {
      socket?.emit('updateRoom', payload)
      socket?.once('roomUpdated', (updatedRoom) => {
        setRoom(updatedRoom)
        resolve(updatedRoom)
      })
      socket?.once('error', (error) => reject(error))
    })
  }

  const handlePlayNextSong = (roomId: string) => {
    return new Promise<any>((resolve, reject) => {
      socket?.emit('playNextMusic', roomId)
      socket?.once('nextMusicReady', (nextMusic) => {
        // Update room with new current music
        setRoom((room) => ({ ...room, currentMusic: nextMusic }) as Room)
        resolve(nextMusic)
      })
      socket?.once('error', (error) => reject(error))
    })
  }

  // const changeRoomPassword = (roomId: string, newPassword: string) => {
  //   return new Promise<Room>((resolve, reject) => {
  //     socket?.emit('changeRoomPassword', { roomId, newPassword })
  //     socket?.once('roomPasswordChanged', (updatedRoom) => {
  //       setRoom(updatedRoom)
  //       resolve(updatedRoom)
  //     })
  //     socket?.once('error', (error) => reject(error))
  //   })
  // }

  // Listen for room events
  useEffect(() => {
    if (!socket) return

    const handleFetchRooms = async () => {
      const allRooms = await getAllRooms()
      setAllRooms(allRooms)
    }

    const handleRoomUpdate = (updatedRoom: Room) => {
      setAllRooms((rooms) =>
        rooms.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
      )
    }

    const handleRoomDeleted = (roomId: string) => {
      setAllRooms((rooms) => rooms.filter((room) => room.id !== roomId))
    }

    handleFetchRooms()

    socket.on('newRoomCreated', handleFetchRooms)
    socket.on('roomDeleted', handleRoomDeleted)
    socket.on('roomSettingsUpdated', handleRoomUpdate)
    return () => {
      socket.off('newRoomCreated', handleFetchRooms)
      socket.off('roomSettingsUpdated', handleRoomUpdate)
      socket.off('roomDeleted', handleRoomDeleted)
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
    leaveRoom,
    addToQueue,
    removeFromQueue,
    updateRoom,
    handlePlayNextSong,
  }
}
