import { Button, Form, Input, Modal } from 'antd'
import { useNotificationStore } from '@/features/shared/stores/notification.store'
import { useRouter } from 'next/navigation'
import { IError } from '@/types/shared'
import useSocketRoom from '../../hooks/useSocketRoom'

interface IProps {
  open: boolean
  onClose: () => void
}

const CreateRoomModal = ({ open, onClose }: IProps) => {
  const [createRoomForm] = Form.useForm()
  const { createRoom, joinRoom } = useSocketRoom()

  const router = useRouter()
  const openNotification = useNotificationStore(
    (state) => state.openNotification
  )

  const handleCreateRoom = async (values: any) => {
    try {
      const roomId = await createRoom({
        host: values.roomName,
      })

      await joinRoom({ roomId })
      onClose()
      openNotification({
        type: 'success',
        message: 'Room created successfully',
        description: 'You have joined the room',
      })
      router.push(`/room/${roomId}`)
    } catch (error) {
      console.error('Room creation failed', error)

      const err = error as IError
      openNotification({
        type: 'error',
        message: 'Room creation failed',
        description: err.message,
      })
    }
  }

  return (
    <Modal title="Create Room" open={open} onCancel={onClose} footer={null}>
      <Form form={createRoomForm} onFinish={handleCreateRoom} layout="vertical">
        <Form.Item
          name="roomName"
          label="Room Name"
          rules={[
            {
              required: true,
              message: 'Please fill in the room name',
            },
          ]}
        >
          <Input placeholder="Fill up your room name" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Create Room
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CreateRoomModal
