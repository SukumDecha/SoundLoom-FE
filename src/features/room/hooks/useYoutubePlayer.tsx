import { useRef, useState, useEffect } from 'react';
import { Room } from '@/types/room';

export const useYouTubePlayer = (room: Room | null) => {
    const [isReady, setIsReady] = useState(false);
    const [duration, setDuration] = useState(0);
    const playerRef = useRef<any>(null);

    const handlePlayerReady = (event: { target: any }) => {
        try {
            playerRef.current = event.target;
            setDuration(event.target.getDuration());
            setIsReady(true);
        } catch (error) {
            console.error("Error in YouTube onReady:", error);
        }
    };

    const seekTo = (time: number) => {
        if (!playerRef.current) return;
        playerRef.current.seekTo(time);
    };

    const setVolume = (value: number) => {
        if (!playerRef.current) return;
        playerRef.current.setVolume(value);
    };

    const getCurrentTime = () => {
        if (!playerRef.current) return 0;
        return playerRef.current.getCurrentTime();
    };

    const playVideo = () => playerRef.current?.playVideo();
    const pauseVideo = () => playerRef.current?.pauseVideo();

    return {
        playerRef,
        isReady,
        duration,
        handlePlayerReady,
        seekTo,
        setVolume,
        getCurrentTime,
        playVideo,
        pauseVideo,
    };
};