'use client';

import { useState, useRef, useEffect } from 'react';;
import Image from 'next/image';
import YouTube from 'react-youtube';
import { IPlaybackPayload, Room } from '@/types/room';
import SongSearchModal from '@/features/music/components/MusicSearchModal';
import { MusicControls } from '@/features/music/components/MusicControls';
import { MusicQueue } from '@/features/music/components/MusicQueues';
import { VolumeControls } from '@/features/room/components/VolumeControls';
import { useSocketStore } from '@/features/shared/stores/socket.store';
import { youtubeOpts } from '@/features/shared/consts/youtube';
import { Button } from 'antd';
import { RetweetOutlined, SoundOutlined, SwapOutlined } from '@ant-design/icons';

interface RoomWrapperProps {
  room: Room | null;
  onQuit: () => void;
  onUpdateRoom: (payload: {
    roomId: string;
    updatedRoom: Partial<Room>;
  }) => Promise<Room>;
  onPlayPreviousSong: (roomId: string) => Promise<Room>;
  onPlayNextSong: (roomId: string) => Promise<Room>;
}

const RoomWrapper = ({
  room,
  onQuit,
  onUpdateRoom,
  onPlayPreviousSong,
  onPlayNextSong,
}: RoomWrapperProps) => {
  // State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(50);
  const [progress, setProgress] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  // Refs
  const socket = useSocketStore((state) => state.socket);
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // Helper Functions
  const resetPlaybackState = () => {
    setHasInitialized(false);
    setIsEnded(false);
    setIsReady(false);
    setProgress(0);
    stopProgressTracking();
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

  const synchronizeWithRoom = () => {
    if (!playerRef.current || !isReady || !room?.currentMusic) return;

    if (room.settings.music.playing && room.settings.music.startTimestamp) {
      // Calculate elapsed time since the start timestamp
      const elapsedTime = (Date.now() - room.settings.music.startTimestamp) / 1000;
      playerRef.current.seekTo(elapsedTime);

      playerRef.current.playVideo();
      setIsPlaying(true);
      startProgressTracking();
    } else if (!room.settings.music.playing && room.settings.music.startTimestamp) {
      playerRef.current.seekTo(room.settings.music.startTimestamp);
      playerRef.current.pauseVideo();
      setIsPlaying(false);
      stopProgressTracking();
    }
  };

  // Event Handlers
  const doPlay = async () => {
    if (!playerRef.current || !room) return;
    const currentTime = playerRef.current.getCurrentTime();

    try {
      socket?.emit('updatePlayback', {
        roomId: room.id,
        currentTime,
        isPlaying: true
      });
    } catch (error) {
      console.error('Failed to update playback:', error);
    }
  };

  const doPause = async () => {
    if (!playerRef.current || !room) return;
    const currentTime = playerRef.current.getCurrentTime();

    try {
      socket?.emit('updatePlayback', {
        roomId: room.id,
        currentTime,
        isPlaying: false
      });
    } catch (error) {
      console.error('Failed to update playback:', error);
    }
  };

  const doPlayNextSong = async () => {
    if (!room) return;

    if (room.queues.length > 0) {
      await onPlayNextSong(room.id);
      resetPlaybackState();
    } else {
      await onUpdateRoom({
        roomId: room.id,
        updatedRoom: {
          ...room,
          currentMusic: null,
        },
      });
      resetPlaybackState();
    }
  };

  const doPlayPreviousSong = async () => {
    if (!room?.previousMusic.length) return;
    await onPlayPreviousSong(room.id);
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
    if (playerRef.current) {
      playerRef.current.setVolume(value);
    }
  };

  const handleYouTubeStateChange = (event: { data: number }) => {
    switch (event.data) {
      case YouTube.PlayerState.PLAYING:
        if (room?.settings.music.playing) {
          setIsPlaying(true);
          startProgressTracking();
        } else {
          setIsPlaying(false);
          playerRef.current?.pauseVideo();
        }
        break;
      case YouTube.PlayerState.PAUSED:
        setIsPlaying(false);
        stopProgressTracking();
        break;
      case YouTube.PlayerState.ENDED:
        if (progress !== 0) {
          setIsEnded(true);
          stopProgressTracking();
        }
        break;
    }
  };

  useEffect(() => {
    return () => {
      stopProgressTracking();
    };
  }, []);

  useEffect(() => {
    const onPlaybackUpdated = (payload: IPlaybackPayload) => {
      if (!playerRef.current || !isReady) return;

      if (payload.isPlaying) {
        const elapsedTime = (Date.now() - payload.startTimestamp) / 1000;
        playerRef.current.seekTo(elapsedTime);
        playerRef.current.playVideo();
        setIsPlaying(true);
        startProgressTracking();
      } else {
        playerRef.current.seekTo(payload.currentTime);
        playerRef.current.pauseVideo();
        setIsPlaying(false);
        stopProgressTracking();
      }
    };

    socket?.on('playbackUpdated', onPlaybackUpdated);
    return () => {
      socket?.off('playbackUpdated', onPlaybackUpdated);
    };
  }, [socket, isReady]);

  useEffect(() => {
    if (isEnded) {
      doPlayNextSong();
    }
  }, [isEnded]);

  useEffect(() => {
    if (isReady && room?.currentMusic) {
      synchronizeWithRoom();
      setHasInitialized(true);
    }
  }, [isReady, room?.currentMusic?.id.videoId]);

  useEffect(() => {
    if (room && isReady && hasInitialized) {
      synchronizeWithRoom();
    }
  }, [room?.settings.music.startTimestamp, room?.settings.music.playing]);

  useEffect(() => {
    if (room?.currentMusic?.id.videoId) {
      resetPlaybackState();
    }
  }, [room?.id, room?.currentMusic?.id.videoId]);

  useEffect(() => {
    if (room && !room.currentMusic && room.queues.length > 0) {
      doPlayNextSong();
    }
  }, [room]);

  // Render
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
    <div className="w-full h-full bg-black text-white max-w-2xl">
      <div className="flex flex-col md:flex-row flex-1 gap-6 p-8">
        <div className="flex-1">
          <div className="aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 to-gray-900">
            {room.currentMusic?.id.videoId ? (
              <Image
                src={room.currentMusic.snippet.thumbnails.high.url}
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
            room={room}
            isPlaying={isPlaying}
            progress={progress}
            onProgressChange={doSeekTo}
            onPlay={doPlay}
            onPause={doPause}
            onNext={doPlayNextSong}
            onPrevious={doPlayPreviousSong}
            duration={duration}
          />
        </div>

        <div className="flex flex-col">
          <MusicQueue
            queue={room.queues}
            onSearch={() => setIsSearchModalVisible(true)}
          />

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outlined"
                  size="small"
                  className={`${room.settings.music.loop ? 'bg-primary text-primary-foreground' : ''
                    }`}
                >
                  <RetweetOutlined className="h-4 w-4" />
                </Button>
                <Button
                  variant="solid"
                  size="small"
                  className={`${room.settings.music.shuffle ? 'bg-primary text-primary-foreground' : ''
                    }`}
                >
                  <SwapOutlined className="h-4 w-4" />
                </Button>
              </div>

              <VolumeControls volume={volume} onVolumeChange={doChangeVolume} />
            </div>

            <Button
              onClick={onQuit}
              color="danger"
              size="small"
              className="w-full"
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
          onReady={(event: { target: any }) => {
            try {
              playerRef.current = event.target;
              setDuration(event.target.getDuration());
              setIsReady(true);
            } catch (error) {
              console.error("Error in YouTube onReady:", error);
            }
          }}
          onStateChange={handleYouTubeStateChange}
          className="hidden"
        />
      )}
    </div>
  );
};

export default RoomWrapper;