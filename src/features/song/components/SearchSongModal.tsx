import { Button, Input, List, Modal } from 'antd'
import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Song } from '../types'

interface IProps {
  open: boolean
  onClose: () => void
}

const SearchSongModal = ({ open, onClose }: IProps) => {
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
          enterButton
          className="[&_.ant-btn]:bg-white/10 [&_.ant-input]:bg-gray-800 [&_.ant-input]:text-white"
        />
        <List
          dataSource={[]}
          renderItem={(song: Song) => (
            <div className="flex items-center justify-between border-b border-gray-800 py-3">
              <div className="text-white">
                <div className="font-medium">{song.title}</div>
                <div className="text-sm text-gray-400">{song.artist}</div>
              </div>
              <Button
                type="text"
                icon={<PlusOutlined />}
                className="text-white hover:text-blue-400"
              >
                Add
              </Button>
            </div>
          )}
        />
      </div>
    </Modal>
  )
}

export default SearchSongModal
