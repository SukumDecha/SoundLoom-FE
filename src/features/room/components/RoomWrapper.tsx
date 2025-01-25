'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import YouTube from 'react-youtube';
import { Room } from '@/types/room';
import SongSearchModal from '@/features/music/components/MusicSearchModal';
import { MusicControls } from '@/features/music/components/MusicControls';
import { MusicQueue } from '@/features/music/components/MusicQueues';
import { VolumeControls } from '@/features/room/components/VolumeControls';
import { useSocketStore } from '@/features/shared/stores/socket.store';
import { youtubeOpts } from '@/features/shared/consts/youtube';
import { Button } from 'antd';
import { RetweetOutlined, SoundOutlined, SwapOutlined } from '@ant-design/icons';
import { usePlaybackState } from '../hooks/usePlaybackState';
import { useYouTubePlayer } from '../hooks/useYoutubePlayer';

interface IProps {
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
}: IProps) => {
  const [isSearchModalVisible, setIsSearchModalVisible] = useState(false);
  const [volume, setVolume] = useState(50);
  const socket = useSocketStore((state) => state.socket);

  const playerState = useYouTubePlayer(room);
  const playbackState = usePlaybackState(room, playerState, onPlayNextSong);

  const handlePlay = async () => {
    if (!room) return;
    const currentTime = playerState.getCurrentTime();

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

  const handlePause = async () => {
    if (!room) return;
    const currentTime = playerState.getCurrentTime();

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

  const handlePlayNextSong = async () => {
    if (!room) return;

    if (room.queues.length > 0) {
      await onPlayNextSong(room.id);
      playbackState.resetPlaybackState();
    } else {
      await onUpdateRoom({
        roomId: room.id,
        updatedRoom: {
          ...room,
          currentMusic: null,
        },
      });
      playbackState.resetPlaybackState();
    }
  };

  const handleSeekTo = (value: number) => {
    if (!room) return;
    const newTime = (value / 100) * playerState.duration;
    playerState.seekTo(newTime);

    socket?.emit('updatePlayback', {
      roomId: room.id,
      currentTime: newTime,
      isPlaying: playbackState.isPlaying,
    });
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    playerState.setVolume(value);
  };

  const handleToggleVolume = () => {
    if (volume === 0) {
      setVolume(50);
      playerState.setVolume(50);
    } else {
      setVolume(0);
      playerState.setVolume(0);
    }
  }

  const handleYouTubeStateChange = (event: { data: number }) => {
    switch (event.data) {
      case YouTube.PlayerState.PLAYING:
        if (room?.settings.music.playing) {
          playbackState.setIsPlaying(true);
          playbackState.startProgressTracking();
        } else {
          playbackState.setIsPlaying(false);
          playerState.pauseVideo();
        }
        break;
      case YouTube.PlayerState.PAUSED:
        playbackState.setIsPlaying(false);
        playbackState.stopProgressTracking();
        break;
      case YouTube.PlayerState.ENDED:
        if (playbackState.progress !== 0) {
          playbackState.setIsEnded(true);
          playbackState.stopProgressTracking();
        }
        break;
    }
  };

  useEffect(() => {
    if (playerState.isReady && room?.currentMusic) {
      playbackState.synchronizeWithRoom();
      playbackState.syncProgressTracking()
      playbackState.setHasInitialized(true);
    }
  }, [playerState.isReady, room?.currentMusic?.id.videoId]);

  useEffect(() => {
    if (room && playerState.isReady && playbackState.hasInitialized) {
      playbackState.synchronizeWithRoom();
    }
  }, [room?.settings.music.startTimestamp, room?.settings.music.playing]);

  useEffect(() => {
    if (room?.currentMusic?.id.videoId) {
      playbackState.resetPlaybackState();
    }
  }, [room?.id, room?.currentMusic?.id.videoId]);

  useEffect(() => {
    if (room && !room.currentMusic && room.queues.length > 0) {
      handlePlayNextSong();
    }
  }, [room]);

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
            isPlaying={playbackState.isPlaying}
            progress={playbackState.progress}
            onProgressChange={handleSeekTo}
            onPlay={handlePlay}
            onPause={handlePause}
            onNext={handlePlayNextSong}
            onPrevious={() => onPlayPreviousSong(room.id)}
            duration={playerState.duration}
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
                  className={`${room.settings.music.loop ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  <RetweetOutlined className="h-4 w-4" />
                </Button>
                <Button
                  variant="solid"
                  size="small"
                  className={`${room.settings.music.shuffle ? 'bg-primary text-primary-foreground' : ''}`}
                >
                  <SwapOutlined className="h-4 w-4" />
                </Button>
              </div>

              <VolumeControls volume={volume} onVolumeChange={handleVolumeChange} onToggleVolume={handleToggleVolume} />
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
          onReady={playerState.handlePlayerReady}
          onStateChange={handleYouTubeStateChange}
          className="hidden"
        />
      )}
    </div>
  );
};

export default RoomWrapper;