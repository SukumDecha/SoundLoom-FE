import { Music } from "./music"

export interface RoomSettings {
  music: {
    loop: boolean
    shuffle: boolean
    playing: boolean
    startTimestamp: number | null;
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
  currentMusic: Music | null
  queues: Music[]
  previousMusic: Music[]
  settings: RoomSettings
}

export interface IPlaybackPayload {
  currentTime: number
  isPlaying: boolean
  startTimestamp: number
}