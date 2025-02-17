import { Socket } from 'socket.io-client'
import { create } from 'zustand'

type SocketStore = {
  socket: Socket | null
  setSocket: (socket: Socket) => void
}

export const useSocketStore = create<SocketStore>((set) => ({
  socket: null,
  setSocket: (payload) => {
    set({ socket: payload })
  },
}))
