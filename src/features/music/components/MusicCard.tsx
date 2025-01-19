import React from 'react'
import useSocketRoom from '@/features/room/hooks/useSocketRoom'
import { PlusOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { Music } from '@/types/music'
import Image from 'next/image'
import { useNotificationStore } from '@/features/shared/stores/notification.store'

interface IProps {
  music: Music
}

const MusicCard = ({ music }: IProps) => {
  const { room, addToQueue } = useSocketRoom()

  const openNotification = useNotificationStore((state) => state.openNotification)

  const isMusicInQueue = room?.queues.some((q: Music) => q.id.videoId === music.id.videoId)

  const handleAddToQueue = () => {
    if (!room) {
      openNotification({
        message: 'Failed to add music to queue',
        description: 'You need to join a room first',
        type: 'error',
      })
      return
    }

    try {
      addToQueue(room.id, music)
      openNotification({
        message: 'Music added to queue',
        description: `${music.snippet.title} has been added to the queue`,
        type: 'success',
      })
    } catch (error) {
      console.error('Failed to add music to queue:', error)
      openNotification({
        message: 'Failed to add music to queue',
        description: (error as any).message,
        type: 'error',
      })
    }
  }

  if (!room) return null

  return (
    <div className="flex items-center justify-between border-b border-gray-800 py-3">
      <div className="-image w-16 h-16 relative">
        <Image
          src={music.snippet.thumbnails.medium.url}
          alt={music.snippet.title}
          width={100}
          height={60}
          objectFit='cover'
        />
      </div>
      <div className="text-white">
        <div className="font-medium">{music.snippet.title}</div>
        <div className="text-sm text-gray-400">{music.snippet.channelTitle}</div>
      </div>
      <Button
        type="text"
        icon={<PlusOutlined />}
        className="text-white hover:text-blue-400"
        disabled={isMusicInQueue}
        onClick={handleAddToQueue}
      >
        Add
      </Button>
    </div>
  )
}

export default MusicCard
