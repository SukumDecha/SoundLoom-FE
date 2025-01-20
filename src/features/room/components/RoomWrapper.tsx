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
import { IPlaybackPayload, Room } from '@/types/room';
import SongSearchModal from '@/features/music/components/MusicSearchModal';
import { MusicControls } from '@/features/music/components/MusicControls';
import { MusicQueue } from '@/features/music/components/MusicQueues';
import { VolumeControls } from '@/features/room/components/VolumeControls';
import { useSocketStore } from '@/features/shared/stores/socket.store';
import { youtubeOpts } from '@/features/shared/consts/youtube';

interface RoomWrapperProps {
  room: Room | null;
  onQuit: () => void;
  onUpdateRoom: (payload: {
    roomId: string;
    updatedRoom: Partial<Room>;
  }) => Promise<Room>
  onPlayNextSong: (roomId: string) => Promise<Room>;
}

const RoomWrapper = ({ room, onQuit, onPlayNextSong, onUpdateRoom }: RoomWrapperProps) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false)

  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);

  const [hasInitialized, setHasInitialized] = useState<boolean>(false);

  const [volume, setVolume] = useState<number>(50);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const socket = useSocketStore((state) => state.socket)

  const playerRef = useRef<any>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const synchronizationTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (synchronizationTimeout.current) {
        clearTimeout(synchronizationTimeout.current);
      }
      stopProgressTracking();
    };
  }, []);

  useEffect(() => {
    const onPlaybackUpdated = (payload: IPlaybackPayload) => {
      if (!playerRef.current || !isReady) return;

      playerRef.current.seekTo(payload?.currentTime);

      if (payload.isPlaying) {
        playerRef.current.playVideo();
        setIsPlaying(true);
        startProgressTracking();
      } else {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
        stopProgressTracking();
      }
    }

    socket?.on('playbackUpdated', onPlaybackUpdated)

    return () => {
      stopProgressTracking()
      socket?.off('playbackUpdated', onPlaybackUpdated)
    };
  }, [socket, isReady]);

  useEffect(() => {
    if (isEnded) {
      doPlayNextSong();
    }
  }, [isEnded]);

  useEffect(() => {
    if (isReady && room?.currentMusic && !hasInitialized) {
      setProgress(0)

      synchronizationTimeout.current = setTimeout(async () => {

        await socket?.emit('updatePlayback', {
          roomId: room.id,
          currentTime: room.settings.music?.startTimestamp,
          isPlaying: true
        });

        synchronizePlayback();
        setHasInitialized(true);
      }, 1000);
    }
  }, [room?.currentMusic?.id.videoId, isReady, hasInitialized]);

  // When song is changed, reset the state
  useEffect(() => {
    if (room?.currentMusic?.id.videoId) {
      setHasInitialized(false);
      setIsReady(false)
      setProgress(0)
      stopProgressTracking()
    }
  }, [room?.id, room?.currentMusic?.id.videoId]);

  useEffect(() => {
    if (room && !room.currentMusic && room.queues.length > 0) {
      doPlayNextSong()
    }
  }, [room]);

  const doPlay = async () => {
    if (!playerRef.current || !room) return;

    const currentTime = playerRef.current.getCurrentTime();

    socket?.emit('updatePlayback', {
      roomId: room.id,
      currentTime,
      isPlaying: true
    })
  };

  const doPause = () => {
    if (!playerRef.current || !room) return;

    const currentTime = playerRef.current.getCurrentTime();

    socket?.emit('updatePlayback', {
      roomId: room.id,
      currentTime,
      isPlaying: false
    });
  };

  const doPlayNextSong = async () => {
    if (!room) return;

    if ((!room.currentMusic || isEnded) && room.queues.length > 0) {
      const updatedRoom = await onPlayNextSong(room.id);

      // After playing next song, update the playback state for all clients
      if (updatedRoom.currentMusic) {
        await socket?.emit('updatePlayback', {
          roomId: room.id,
          currentTime: 0,
          isPlaying: true
        });

        setIsEnded(false);
        setIsReady(false)
        setHasInitialized(false)
        setProgress(0)
      }
    } else if ((room.currentMusic && isEnded) && room.queues.length === 0) {
      await onUpdateRoom({
        roomId: room.id,
        updatedRoom: {
          ...room,
          currentMusic: null,
        },
      })

      setHasInitialized(false);
      setIsEnded(false);
      setIsReady(false)
      setProgress(0)
      stopProgressTracking()
    }
  };

  const doSeekTo = (value: number) => {
    if (!playerRef.current || !room) return;
    const newTime = (value / 100) * duration;
    setProgress(value);

    playerRef.current.seekTo(newTime);

    socket?.emit('updatePlayback', {
      roomId: room.id,
      currentTime: newTime,
      isPlaying: isPlaying,
    });
  };

  const doChangeVolume = (value: number) => {
    setVolume(value);

    if (playerRef.current) playerRef.current.setVolume(value);
  };

  const startProgressTracking = () => {
    stopProgressTracking();
    progressInterval.current = setInterval(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();

        const newProgress = (currentTime / duration) * 100;
        setProgress(newProgress);
      }
    }, 1000);
  };

  const stopProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  };

  const synchronizePlayback = () => {
    if (!room?.settings.music.startTimestamp || !playerRef.current || !isReady) {
      console.error("Synchronization skipped - not ready");
      return;
    }

    try {
      if (room.settings.music.playing) {
        const currentTime = (Date.now() - room.settings.music.startTimestamp) / 1000;
        const safeTime = Math.min(currentTime, duration);
        playerRef.current.seekTo(safeTime);
        playerRef.current.playVideo();
        setIsPlaying(true);
        startProgressTracking();
      } else {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
        stopProgressTracking();
      }
    } catch (error) {
      console.error("Error during synchronization:", error);
    }
  };

  // Update YouTube event handler
  const handleYouTubeStateChange = (event: { data: number }) => {
    if (event.data === YouTube.PlayerState.PLAYING) {
      if (room?.settings.music.playing) {
        setIsPlaying(true);
        startProgressTracking();
      } else {
        playerRef.current?.pauseVideo();
      }
    } else if (event.data === YouTube.PlayerState.PAUSED) {
      setIsPlaying(false);
      stopProgressTracking();
    } else if (event.data === YouTube.PlayerState.ENDED) {
      setIsEnded(true);
      stopProgressTracking();
    }
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

  return (
    <div className="w-full h-full bg-black text-white max-w-2xl border-4 border-red-500">
      <div className="flex flex-col md:flex-row flex-1 gap-6 p-8">
        {/* Current Playing Section */}
        <div className="flex-1">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 to-gray-900">
            {room.currentMusic?.id.videoId ? (
              <Image
                // src={`https://img.youtube.com/vi/${room.currentMusic.id.videoId}/0.jpg`}
                src={`${room.currentMusic.snippet.thumbnails.high.url}`}
                alt={room.currentMusic.snippet.title}
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
            onProgressChange={doSeekTo}
            onPlay={doPlay}
            onPause={doPause}
            onNext={doPlayNextSong}
            duration={duration}
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
                onVolumeChange={doChangeVolume}
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
            try {
              playerRef.current = event.target;
              setDuration(event.target.getDuration());
              setIsReady(true);
            } catch (error) {
              console.error("Error in YouTube onReady:", error);
            }
          }}
          onStateChange={handleYouTubeStateChange}
        />
      )}
    </div>
  );
};

export default RoomWrapper;