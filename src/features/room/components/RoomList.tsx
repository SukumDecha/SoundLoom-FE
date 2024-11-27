import React, { useState } from 'react'
import {
  Row,
  Col,
  Button,
  Typography,
  Modal,
  Form,
  Input,
  FloatButton,
} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { useSocketRoom } from '../hooks/useSocketRoom'
import RoomCard from './RoomCard'

const { Title } = Typography

const RoomLandingPage: React.FC = () => {
  const [createRoomModal, setCreateRoomModal] = useState(false)
  const { createRoom, joinRoom, allRooms } = useSocketRoom()

  const [createRoomForm] = Form.useForm()

  const handleCreateRoom = async (values: any) => {
    try {
      const roomId = await createRoom({
        host: values.username,
      })

      await joinRoom({ roomId })
      setCreateRoomModal(false)
    } catch (error) {
      console.error('Room creation failed', error)
    }
  }

  const handleJoinRoom = async (roomId: string) => {
    try {
      await joinRoom({ roomId })
    } catch (error) {
      console.error('Join room failed', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
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

      <FloatButton
        icon={<PlusOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setCreateRoomModal(true)}
      />

      <Modal
        title="Create Room"
        open={createRoomModal}
        onCancel={() => setCreateRoomModal(false)}
        footer={null}
      >
        <Form
          form={createRoomForm}
          onFinish={handleCreateRoom}
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="Your Username"
            rules={[
              {
                required: true,
                message: 'Please input your username',
              },
            ]}
          >
            <Input placeholder="Enter your username" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Create Room
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default RoomLandingPage
