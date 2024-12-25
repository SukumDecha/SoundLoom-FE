'use client';

import { useState, useRef, useEffect, SetStateAction } from 'react';
import { Button } from 'antd';
import {
  RetweetOutlined,
  SwapOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import Image from 'next/image';
import YouTube from 'react-youtube';
import { Room } from '@/types/room';
import SongSearchModal from '@/features/music/components/MusicSearchModal';
import { MusicControls } from '@/features/music/components/MusicControls';
import { MusicQueue } from '@/features/music/components/MusicQueues';
import { VolumeControls } from '@/features/room/components/VolumeControls';

interface RoomWrapperProps {
  room: Room | null;
  onQuit: () => void;
  onPlayNextSong: (roomId: string) => void;
}

const RoomWrapper = ({ room, onQuit, onPlayNextSong }: RoomWrapperProps) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [volume, setVolume] = useState<number>(50);
  const [progress, setProgress] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const playerRef = useRef<any>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  useEffect(() => {
    if (room && !room.currentMusic && room.queues.length > 0) {
      onPlayNextSong(room.id);
    }
  }, [room]);

  useEffect(() => {
    if (isEnded && room) {
      onPlayNextSong(room.id);
      setIsEnded(false);
    }
  }, [isEnded]);

  const handlePlay = () => {
    if (playerRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
      startProgressTracking();
    }
  };

  const handlePause = () => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  const startProgressTracking = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        setCurrentTime(currentTime);
        setProgress((currentTime / duration) * 100);
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  const handleProgressChange = (value: number) => {
    const newTime = (value / 100) * duration;
    setProgress(value);
    setCurrentTime(newTime);
    if (playerRef.current) playerRef.current.seekTo(newTime);
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (playerRef.current) playerRef.current.setVolume(value);
  };

  if (!room) {
    return (
      <div className="grid h-screen w-full place-items-center bg-black text-white">
        <Button
          onClick={() => (window.location.href = '/')}
          className="bg-white text-black hover:bg-gray-100"
        >
          Return Home
        </Button>
      </div>
    );
  }

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
  };

  return (
    <div className="flex h-screen w-full bg-black text-white md:w-4/5">
      <div className="flex flex-1 gap-6 p-8">
        {/* Current Playing Section */}
        <div className="flex-1">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 to-gray-900">
            {room.currentMusic?.id.videoId ? (
              <Image
                src={`https://img.youtube.com/vi/${room.currentMusic.id.videoId}/0.jpg`}
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
              {room.currentMusic?.snippet.title || 'No song playing'}
            </h2>
            <p className="text-gray-400">
              {room.currentMusic?.snippet.channelTitle || 'Select a song to play'}
            </p>
          </div>

          <MusicControls
            isPlaying={isPlaying}
            progress={progress}
            onProgressChange={handleProgressChange}
            onPlay={handlePlay}
            onPause={handlePause}
          />
        </div>

        <div className="flex flex-col">
          <MusicQueue
            queue={room.queues}
            onSearchClick={() => setIsSearchModalVisible(true)}
          />

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  type="text"
                  icon={<RetweetOutlined />}
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${room.settings.music.loop ? 'bg-green-500' : 'bg-white/10'
                    } text-white hover:bg-white/20`}
                />
                <Button
                  type="text"
                  icon={<SwapOutlined />}
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${room.settings.music.shuffle ? 'bg-green-500' : 'bg-white/10'
                    } text-white hover:bg-white/20`}
                />
              </div>

              <VolumeControls
                volume={volume}
                onVolumeChange={handleVolumeChange}
              />
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

      <SongSearchModal
        open={isSearchModalVisible}
        onClose={() => setIsSearchModalVisible(false)}
      />

      {room.currentMusic?.id.videoId && (
        <YouTube
          videoId={room.currentMusic.id.videoId}
          opts={youtubeOpts}
          onReady={(event: { target: { getDuration: () => SetStateAction<number>; }; }) => {
            playerRef.current = event.target;
            setDuration(event.target.getDuration());
          }}
          onStateChange={(event: { data: number; }) => {
            if (event.data === YouTube.PlayerState.PLAYING) {
              setIsPlaying(true);
              startProgressTracking();
            } else if (event.data === YouTube.PlayerState.PAUSED) {
              setIsPlaying(false);
              stopProgressTracking();
            } else if (event.data === YouTube.PlayerState.ENDED) {
              setIsEnded(true);
            }
          }}
        />
      )}
    </div>
  );
};

export default RoomWrapper;