import { Dropdown, type MenuProps } from "antd"
import { IconTrash } from "@tabler/icons-react"
import useSocketRoom from "@/features/room/hooks/useSocketRoom"

const items: MenuProps['items'] = [{
    label: 'Remove this song from queue',
    key: '4',
    icon: <IconTrash />,
    danger: true,
},]

interface IProps {
    children: React.ReactNode
    musicId: string
}

const MusicQueueDropdown = ({ children, musicId }: IProps) => {
    const { room, removeFromQueue } = useSocketRoom()

    const handleMenuClick: MenuProps['onClick'] = async (e) => {
        if (!room) return

        await removeFromQueue(room.id, musicId)
    };

    const menuProps = {
        items,
        onClick: handleMenuClick
    }
    return <Dropdown menu={menuProps} placement="topRight">
        {children}
    </Dropdown>


}

export default MusicQueueDropdown