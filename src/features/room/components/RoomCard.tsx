import { Card, Button } from 'antd'
import { UsergroupAddOutlined } from '@ant-design/icons'

interface IProps {
  roomId: string
  host: string
  listeners: number
  currentMusic: string
  onJoin: (roomId: string) => void
}

const RoomCard = ({
  roomId,
  host,
  listeners,
  currentMusic,
  onJoin,
}: IProps) => (
  <Card
    hoverable
    actions={[
      <Button
        key="join"
        type="primary"
        icon={<UsergroupAddOutlined />}
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
          <div>Playing: {currentMusic || 'None'}</div>
          <div>Listeners: {listeners}</div>
        </div>
      }
    />
  </Card>
)

export default RoomCard
