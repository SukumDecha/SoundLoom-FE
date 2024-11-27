export interface RoomSettings {
  music: {
    loop: boolean
    shuffle: boolean
    volume: number
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
  currentMusic: any
  queues: any[]
  settings: RoomSettings
}
