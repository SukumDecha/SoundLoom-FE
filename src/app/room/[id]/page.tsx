'use client'

import MusicRoom from '@/features/room/components/MusicRoom'
import { useSocketRoom } from '@/features/room/hooks/useSocketRoom'
import { useNotificationStore } from '@/features/shared/stores/notification.store'
import { useSocketStore } from '@/features/shared/stores/socket.store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface IProps {
  params: { id: string }
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const MusicRoomPage = ({ params }: IProps) => {
  const router = useRouter()
  const socket = useSocketStore((state) => state.socket)
  const openNotification = useNotificationStore(
    (state) => state.openNotification
  )

  const { room, leaveRoom } = useSocketRoom()

  const { id } = params

  const handleQuit = async () => {
    try {
      await leaveRoom(id)
      router.replace('/')

      openNotification({
        type: 'success',
        message: 'Left Room',
        description: 'You have left the room',
      })
    } catch (error) {
      openNotification({
        message: 'Error while leaving room',
        description: (error as any).message,
        type: 'error',
      })
    }
  }

  useEffect(() => {
    const validateSocket = async () => {
      if (!socket) return
      if (!room) {
        openNotification({
          message: 'Room not found',
          description: 'Please try again later',
          type: 'error',
        })
        router.replace('/')
      }
    }

    validateSocket()
  }, [socket, room])

  return (
    <div className="container flex h-full w-full justify-center">
      <MusicRoom room={room} onQuit={handleQuit} />
    </div>
  )
}

export default MusicRoomPage
