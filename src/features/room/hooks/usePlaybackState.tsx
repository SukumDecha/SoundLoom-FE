import { useState, useRef, useEffect } from 'react';
import { Room } from '@/types/room';
import { useSocketStore } from '@/features/shared/stores/socket.store';
import { IPlaybackPayload } from '@/types/room';
import { useYouTubePlayer } from './useYoutubePlayer';

export const usePlaybackState = (
    room: Room | null,
    playerState: ReturnType<typeof useYouTubePlayer>,
    onPlayNextSong: (roomId: string) => Promise<Room>
) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isEnded, setIsEnded] = useState(false);
    const [hasInitialized, setHasInitialized] = useState(false);
    const [progress, setProgress] = useState(0);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);
    const socket = useSocketStore((state) => state.socket);

    const syncProgressTracking = () => {
        if (!room || room.settings.music.startTimestamp === null) {
            console.error("! Failed to sync progress tracking: room / startTimestamp is null");
            return;
        }

        if (playerState.playerRef.current) {
            const elapsedTime = room.settings.music.startTimestamp

            const newProgress = (elapsedTime / playerState.duration) * 100;

            // playerState.seekTo(elapsedTime);
            setProgress(newProgress);
        }
    };

    const startProgressTracking = () => {
        stopProgressTracking();
        progressInterval.current = setInterval(() => {
            if (playerState.playerRef.current) {
                const currentTime = playerState.getCurrentTime();
                const newProgress = (currentTime / playerState.duration) * 100;
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

    const resetPlaybackState = () => {
        setHasInitialized(false);
        setIsEnded(false);
        setProgress(0);
        stopProgressTracking();
    };

    const synchronizeWithRoom = () => {
        if (!playerState.playerRef.current || !playerState.isReady || !room?.currentMusic) return;

        if (room.settings.music.playing && room.settings.music.startTimestamp) {
            const elapsedTime = (Date.now() - room.settings.music.startTimestamp) / 1000;
            playerState.seekTo(elapsedTime);
            playerState.playVideo();
            setIsPlaying(true);
            startProgressTracking();
        } else if (!room.settings.music.playing && room.settings.music.startTimestamp) {
            playerState.seekTo(room.settings.music.startTimestamp);
            playerState.pauseVideo();
            setIsPlaying(false);
            stopProgressTracking();
        }
    };

    useEffect(() => {
        const onPlaybackUpdated = (payload: IPlaybackPayload) => {
            if (!playerState.playerRef.current || !playerState.isReady) return;

            if (payload.isPlaying) {
                const elapsedTime = (Date.now() - payload.startTimestamp) / 1000;
                playerState.seekTo(elapsedTime);
                playerState.playVideo();
                setIsPlaying(true);
                startProgressTracking();
            } else {
                playerState.seekTo(payload.currentTime);
                playerState.pauseVideo();
                setIsPlaying(false);
                stopProgressTracking();
            }
        };

        socket?.on('playbackUpdated', onPlaybackUpdated);
        return () => {
            socket?.off('playbackUpdated', onPlaybackUpdated);
        };
    }, [socket, playerState.isReady]);

    useEffect(() => {
        if (isEnded && room) {
            onPlayNextSong(room.id);
        }
    }, [isEnded, room]);

    useEffect(() => {
        return () => {
            stopProgressTracking();
        };
    }, []);

    return {
        isPlaying,
        isEnded,
        progress,
        hasInitialized,
        setIsPlaying,
        setIsEnded,
        setHasInitialized,
        resetPlaybackState,
        synchronizeWithRoom,
        syncProgressTracking,
        startProgressTracking,
        stopProgressTracking,
    };
};