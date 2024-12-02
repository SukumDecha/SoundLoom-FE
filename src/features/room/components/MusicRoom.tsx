'use client'

import { useState, useRef, useEffect } from 'react'
import { Button, List, Slider } from 'antd'
import {
  SearchOutlined,
  RetweetOutlined,
  SwapOutlined,
  SoundOutlined,
  StepForwardOutlined,
  StepBackwardOutlined,
  PauseOutlined,
  PlayCircleOutlined,
  EllipsisOutlined,
} from '@ant-design/icons'
import Image from 'next/image'
import YouTube from 'react-youtube'
import SearchSongModal from '@/features/song/components/SearchSongModal'
import { Room } from '../types'

interface IProps {
  room: Room | null
  onQuit: () => void
  // onAddMusic: () => void
}

export default function MusicRoom({ room, onQuit }: IProps) {
  const [volume, setVolume] = useState<number>(50)
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false)
  const [progress, setProgress] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [duration, setDuration] = useState<number>(0)
  const playerRef = useRef<any>(null)
  const progressInterval = useRef(null)

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [])

  const handlePlay = () => {
    if (playerRef.current) {
      playerRef.current.playVideo()
      setIsPlaying(true)
      startProgressTracking()
    }
  }

  const handlePause = () => {
    if (playerRef.current) {
      playerRef.current.pauseVideo()
      setIsPlaying(false)
      stopProgressTracking()
    }
  }

  const startProgressTracking = () => {
    if (progressInterval.current) clearInterval(progressInterval.current)

    progressInterval.current = setInterval(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime()
        setCurrentTime(currentTime)
        setProgress((currentTime / duration) * 100)
      }
    }, 1000)
  }

  const stopProgressTracking = () => {
    if (progressInterval.current) clearInterval(progressInterval.current)
  }

  const handleProgressChange = (value: number) => {
    const newTime = (value / 100) * duration
    setProgress(value)
    setCurrentTime(newTime)
    if (playerRef.current) playerRef.current.seekTo(newTime)
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value)
    if (playerRef.current) playerRef.current.setVolume(value)
  }

  const onReady = (event: any) => {
    playerRef.current = event.target
    setDuration(event.target.getDuration())
  }

  const onStateChange = (event: any) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      setIsPlaying(true)
      startProgressTracking()
    } else if (event.data === YouTube.PlayerState.PAUSED) {
      setIsPlaying(false)
      stopProgressTracking()
    }
  }

  if (!room)
    return (
      <div className="grid h-screen w-full place-items-center bg-black text-white">
        <Button
          onClick={() => (window.location.href = '/')}
          className="bg-white text-black hover:bg-gray-100"
        >
          Return Home
        </Button>
      </div>
    )

  const youtubeOpts = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
    },
  }

  return (
    <div className="flex h-screen w-full bg-black text-white md:w-4/5">
      {/* Main Content */}
      <div className="flex flex-1 gap-6 p-8">
        {/* Current Playing Section */}
        <div className="flex-1">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 to-gray-900">
            {room.currentMusic?.youtubeId ? (
              <Image
                src={`https://img.youtube.com/vi/${room.currentMusic.youtubeId}/0.jpg`}
                alt="Album Art"
                className="h-full w-full object-cover"
                width={400}
                height={400}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <SoundOutlined className="text-6xl text-gray-600" />
              </div>
            )}
          </div>
          <div className="mt-4 space-y-1">
            <h2 className="text-2xl font-bold">
              {room.currentMusic?.title || 'No song playing'}
            </h2>
            <p className="text-gray-400">
              {room.currentMusic?.artist || 'Select a song to play'}
            </p>
          </div>
          <div className="mt-8">
            <Slider
              value={progress}
              onChange={handleProgressChange}
              className="[&_.ant-slider-handle]:border-white [&_.ant-slider-rail]:bg-gray-800 [&_.ant-slider-track]:bg-white"
            />
            <div className="mt-4 flex items-center justify-center gap-8">
              <Button
                type="text"
                className="text-white"
                icon={<StepBackwardOutlined />}
              />
              <Button
                type="text"
                className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
                onClick={isPlaying ? handlePause : handlePlay}
              />
              <Button
                type="text"
                className="text-white"
                icon={<StepForwardOutlined />}
              />
            </div>
          </div>
        </div>

        {/* Queue Section */}
        <div className="w-80 flex-none">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Up Next</h3>
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => setIsSearchModalVisible(true)}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white/10 py-2 text-white hover:bg-white/20"
            >
              <SearchOutlined /> Search Music
            </Button>

            {room.queues.length > 0 ? (
              <List
                dataSource={room.queues}
                renderItem={(song) => (
                  <div className="group flex items-center gap-3 rounded-lg p-2 hover:bg-white/5">
                    <div className="h-12 w-12 flex-none overflow-hidden rounded-md bg-gray-800">
                      <img
                        src={`https://img.youtube.com/vi/${song.youtubeId}/0.jpg`}
                        alt={song.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 truncate">
                      <div className="font-medium">{song.title}</div>
                      <div className="text-sm text-gray-400">{song.artist}</div>
                    </div>
                    <EllipsisOutlined className="hidden text-gray-400 group-hover:block" />
                  </div>
                )}
              />
            ) : (
              <div className="text-center text-gray-400">
                The queue is empty
              </div>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  type="text"
                  icon={<RetweetOutlined />}
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    room.settings.music.loop ? 'bg-green-500' : 'bg-white/10'
                  } text-white hover:bg-white/20`}
                />
                <Button
                  type="text"
                  icon={<SwapOutlined />}
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    room.settings.music.shuffle ? 'bg-green-500' : 'bg-white/10'
                  } text-white hover:bg-white/20`}
                />
              </div>
              <div className="flex items-center gap-2">
                <SoundOutlined />
                <Slider
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 [&_.ant-slider-handle]:border-white [&_.ant-slider-rail]:bg-gray-800 [&_.ant-slider-track]:bg-white"
                />
              </div>
            </div>

            <Button
              onClick={onQuit}
              className="w-full rounded-full bg-red-600 text-white hover:bg-red-700"
            >
              Quit Room
            </Button>
          </div>
        </div>
      </div>

      <SearchSongModal
        open={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
      />

      {room.currentMusic?.youtubeId && (
        <YouTube
          videoId={room.currentMusic.youtubeId}
          opts={youtubeOpts}
          onReady={onReady}
          onStateChange={onStateChange}
        />
      )}
    </div>
  )
}
