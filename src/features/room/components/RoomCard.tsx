import { Card, Button } from 'antd'
import { UsergroupAddOutlined } from '@ant-design/icons'
import useSocketRoom from '../hooks/useSocketRoom'
import { Music } from '@/types/music'

interface IProps {
  roomId: string
  host: string
  listeners: number
  currentMusic: Music | null
  onJoin: (roomId: string) => void
}

const RoomCard = ({
  roomId,
  host,
  listeners,
  currentMusic,
  onJoin,
}: IProps) => {
  const { room } = useSocketRoom()

  const isInRoom = room?.id === roomId

  return (
    <Card
      hoverable
      actions={[
        <Button
          key="join"
          type="primary"
          icon={<UsergroupAddOutlined />}
          disabled={isInRoom}
          onClick={() => onJoin(roomId)}
        >
          Join Room
        </Button>,
      ]}
    >
      <Card.Meta
        title={`${host}'s Room`}
        description={
          <div>
            <div>Playing: {currentMusic?.snippet.title || 'None'}</div>
            <div>Listeners: {listeners}</div>
          </div>
        }
      />
    </Card>
  )
}
export default RoomCard
