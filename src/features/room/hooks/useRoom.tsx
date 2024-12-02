import { useRoomStore } from '../stores/room.store'

const useRoom = () => {
  const room = useRoomStore((state) => state.room)
  const allRooms = useRoomStore((state) => state.allRooms)
  const setRoom = useRoomStore((state) => state.setRoom)
  const setAllRooms = useRoomStore((state) => state.setAllRooms)

  return {
    room,
    allRooms,
    setRoom,
    setAllRooms,
  }
}

export default useRoom
