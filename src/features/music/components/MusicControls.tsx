'use client';
import { Button, Slider } from 'antd';
import {
    StepBackwardOutlined,
    StepForwardOutlined,
    PauseOutlined,
    PlayCircleOutlined,
} from '@ant-design/icons';

interface MusicControlsProps {
    isPlaying: boolean;
    progress: number;
    onProgressChange: (value: number) => void;
    onPlay: () => void;
    onPause: () => void;
    onNext?: () => void;
    onPrevious?: () => void;
}

export const MusicControls = ({
    isPlaying,
    progress,
    onProgressChange,
    onPlay,
    onPause,
    onNext,
    onPrevious,
}: MusicControlsProps) => {
    return (
        <div className="mt-8">
            <Slider
                value={progress}
                onChange={onProgressChange}
                className="[&_.ant-slider-handle]:border-white [&_.ant-slider-rail]:bg-gray-800 [&_.ant-slider-track]:bg-white"
            />
            <div className="mt-4 flex items-center justify-center gap-8">
                <Button
                    type="text"
                    className="text-white"
                    icon={<StepBackwardOutlined />}
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
                    className="text-white"
                    icon={<StepForwardOutlined />}
                    onClick={onNext}
                />
            </div>
        </div>
    );
};