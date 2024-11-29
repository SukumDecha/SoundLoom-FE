import { create } from 'zustand'
import { Room } from '../types'

type RoomStore = {
  room: Room | null
  setRoom: (
    payload: Room | null | ((prevRoom: Room | null) => Room | null)
  ) => void
  allRooms: Room[]
  setAllRooms: (payload: Room[] | ((prevRooms: Room[]) => Room[])) => void
}

export const useRoomStore = create<RoomStore>((set) => ({
  room: null,
  allRooms: [],
  setRoom: (payload) => {
    set((state) => ({
      room: typeof payload === 'function' ? payload(state.room) : payload,
    }))
  },
  setAllRooms: (payload) => {
    set((state) => ({
      allRooms:
        typeof payload === 'function' ? payload(state.allRooms) : payload,
    }))
  },
}))
