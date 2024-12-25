import { Input, List, Modal } from 'antd'
import React, { useState } from 'react'
import MusicService from '../services/music.service'
import { useNotificationStore } from '@/features/shared/stores/notification.store'
import { Music } from '@/types/music'
import MusicCard from './MusicCard'

interface IProps {
  open: boolean
  onClose: () => void
}

const MusicSearchModal = ({ open, onClose }: IProps) => {
  const openNotification = useNotificationStore(
    (state) => state.openNotification
  )
  const [listMusic, setListMusic] = useState<Music[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (value: string) => {
    setLoading(true)
    try {
      const listMusic = await MusicService.getItems(value)
      setListMusic(listMusic)
    } catch (error) {
      console.error('Failed to fetch music items:', error)
      openNotification({
        message: 'Failed to fetch music items',
        description: (error as any).message,
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title="Search Music"
      open={open}
      onCancel={onClose}
      footer={null}
      className="[&_.ant-modal-content]:bg-gray-900 [&_.ant-modal-header]:bg-gray-900 [&_.ant-modal-title]:text-white"
    >
      <div className="space-y-4">
        <Input.Search
          placeholder="Search for songs..."
          className="[&_.ant-btn]:bg-white/10 [&_.ant-input]:bg-gray-800 [&_.ant-input]:text-white"
          onSearch={handleSearch}
          loading={loading}
          enterButton
        />
        <List
          dataSource={listMusic}
          renderItem={(music: Music) => <MusicCard music={music} />}
        />
      </div>
    </Modal>
  )
}

export default MusicSearchModal
