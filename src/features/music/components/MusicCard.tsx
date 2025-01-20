import React from 'react'
import useSocketRoom from '@/features/room/hooks/useSocketRoom'
import { PlusOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
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

  return (
    <div className="flex items-center bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 space-x-4 mb-4">
      {/* Thumbnail */}
      <div className="w-16 h-16 relative rounded-md overflow-hidden flex-shrink-0">
        <Image
          src={music.snippet.thumbnails.medium.url}
          alt={music.snippet.title}
          layout="fill"
          objectFit="cover"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-white font-semibold text-base truncate">
          {music.snippet.title}
        </div>
        <div className="text-sm text-gray-400 truncate">{music.snippet.channelTitle}</div>
      </div>

      {/* Add Button */}
      <Tooltip title={isMusicInQueue ? 'Already in queue' : 'Add to queue'}>
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          disabled={isMusicInQueue}
          onClick={handleAddToQueue}
          className="flex-shrink-0"
        />
      </Tooltip>
    </div>
  )
}

export default MusicCard
