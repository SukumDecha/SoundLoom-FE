'use client';
import { Button, Slider } from 'antd';
import {
    StepBackwardOutlined,
    StepForwardOutlined,
    PauseOutlined,
    PlayCircleOutlined,
} from '@ant-design/icons';
import { Room } from '@/types/room';

interface IProps {
    room: Room
    isPlaying: boolean;
    progress: number; // Current progress in seconds
    duration: number; // Total duration in seconds
    onProgressChange: (value: number) => void;
    onPlay: () => void;
    onPause: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
}

export const MusicControls = ({
    isPlaying,
    progress,
    duration,
    onProgressChange,
    onPlay,
    onPause,
    onNext,
    onPrevious,
    room
}: IProps) => {
    const seconds = Math.floor(progress * duration / 100)
    // Format time in MM:SS format
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="mt-8">
            {/* Display current time and total duration */}
            <div className="flex justify-between text-white mb-2">
                <span>{formatTime(seconds)}</span>
                <span>{formatTime(duration)}</span>
            </div>
            <Slider
                value={(progress)} // Progress as percentage
                onChange={(value) => onProgressChange(value)} // Convert percentage back to seconds
                className="[&_.ant-slider-handle]:border-white [&_.ant-slider-rail]:bg-gray-800 [&_.ant-slider-track]:bg-white"
            />
            <div className="mt-4 flex items-center justify-center gap-8">
                <Button
                    type="text"
                    className={`text-white ${room.previousMusic.length === 0 ? 'opacity-50' : ''}`}
                    icon={<StepBackwardOutlined />}
                    disabled={!onPrevious || room.previousMusic.length === 0}
                    onClick={onPrevious}
                />
                <Button
                    type="text"
                    className="flex h-12 w-12 items-center justify-center rounded-full text-white"
                    icon={isPlaying ? <PauseOutlined /> : <PlayCircleOutlined />}
                    onClick={isPlaying ? onPause : onPlay}
                />
                <Button
                    type="text"
                    className={`text-white ${room.queues.length === 0 ? 'opacity-50' : ''}`}
                    disabled={!onNext || room.queues.length === 0}
                    icon={<StepForwardOutlined />}
                    onClick={onNext}
                />
            </div>
        </div>
    );
};
