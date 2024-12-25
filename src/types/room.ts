import { Music } from "./music"

export interface RoomSettings {
  music: {
    loop: boolean
    shuffle: boolean
    playing: boolean
  }
  room: {
    password: string | null
    allowAnyoneControl: boolean
  }
}

export interface Room {
  id: string
  host: string
  currentListeners: number
  currentMusic: Music
  queues: Music[]
  settings: RoomSettings
}
