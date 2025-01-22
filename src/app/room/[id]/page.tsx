'use client'

import RoomWrapper from '@/features/room/components/RoomWrapper'
import useSocketRoom from '@/features/room/hooks/useSocketRoom'
import { useNotificationStore } from '@/features/shared/stores/notification.store'
import { useSocketStore } from '@/features/shared/stores/socket.store'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface IProps {
  params: { id: string }
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const MusicRoomPage = ({ params }: IProps) => {
  const socket = useSocketStore((state) => state.socket)
  const router = useRouter()

  const openNotification = useNotificationStore(
    (state) => state.openNotification
  )

  const { room, leaveRoom, doUpdateRoom, doPlayNextMusic, doPlayPreviousMusic } = useSocketRoom()

  const { id } = params

  const handleQuit = async () => {
    try {
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
        router.replace('/')
      }
    }

    validateSocket()
  }, [socket, room])

  useEffect(() => {
    return () => {
      if (socket && room) {
        leaveRoom(room.id)
      }
    };
  }, []);

  return (
    <div className="container flex h-full w-full justify-center">
      <RoomWrapper
        room={room}
        onQuit={handleQuit}
        onUpdateRoom={doUpdateRoom}
        onPlayPreviousSong={doPlayPreviousMusic}
        onPlayNextSong={doPlayNextMusic} />
    </div>
  )
}

export default MusicRoomPage
