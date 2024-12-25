import React, { useState } from 'react'
import { Row, Col, Typography, FloatButton } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { useNotificationStore } from '@/features/shared/stores/notification.store'
import { useRouter } from 'next/navigation'
import RoomCard from './RoomCard'
import CreateRoomModal from './modals/CreateRoomModal'
import useSocketRoom from '../hooks/useSocketRoom'

const { Title } = Typography

interface IFloatButtonProps {
  onCreate: () => void
  onDelete: () => void
}
const renderFloatButton = ({ onCreate, onDelete }: IFloatButtonProps) => (
  <FloatButton.Group shape="circle">
    <FloatButton
      icon={<PlusOutlined />}
      type="primary"
      style={{ right: 24, bottom: 24 }}
      onClick={onCreate}
    />

    <FloatButton
      icon={<DeleteOutlined />}
      type="primary"
      style={{ right: 24, bottom: 24 }}
      onClick={onDelete}
    />
  </FloatButton.Group>
)

const RoomList: React.FC = () => {
  const [createRoomModal, setCreateRoomModal] = useState(false)
  const { joinRoom, allRooms, deleteAllRooms } = useSocketRoom()

  const router = useRouter()

  const openNotification = useNotificationStore(
    (state) => state.openNotification
  )

  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinRoom({ roomId })
      openNotification({
        type: 'success',
        message: 'Room joined successfully',
        description: 'You have joined the room',
      })

      router.push(`/room/${roomId}`)
    } catch (error) {
      console.error('Join room failed', error)
      openNotification({
        type: 'error',
        message: 'Join room failed',
        description: 'Please try again later',
      })
    }
  }

  const handleCloseModal = () => {
    setCreateRoomModal(false)
  }

  return (
    <div className="min-h-screen bg-gray-700 p-6 dark:bg-white">
      <Title level={2} className="mb-6 text-center">
        Music Rooms
      </Title>

      <Row gutter={[16, 16]}>
        {allRooms.map((room, index) => (
          <Col key={room.id || index} xs={24} sm={12} md={8} lg={6}>
            <RoomCard
              roomId={room.id}
              host={room.host}
              listeners={room.currentListeners}
              currentMusic={room.currentMusic}
              onJoin={handleJoinRoom}
            />
          </Col>
        ))}
      </Row>

      {renderFloatButton({
        onCreate: () => setCreateRoomModal(true),
        onDelete: deleteAllRooms,
      })}
      <CreateRoomModal open={createRoomModal} onClose={handleCloseModal} />
    </div>
  )
}

export default RoomList
