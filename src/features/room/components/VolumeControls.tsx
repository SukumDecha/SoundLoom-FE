import { Slider } from 'antd';
import { SoundOutlined } from '@ant-design/icons';
import { IconVolume, IconVolumeOff } from '@tabler/icons-react';

interface VolumeControlsProps {
    volume: number;
    onVolumeChange: (value: number) => void;
    onToggleVolume: () => void;
}

export const VolumeControls = ({ volume, onVolumeChange, onToggleVolume }: VolumeControlsProps) => {
    return (
        <div className="flex items-center gap-2">
            <div className="hover:cursor-pointer" onClick={onToggleVolume}>
                {
                    volume === 0 ? (
                        <IconVolumeOff className="h-4 w-4 text-white opacity-50" />
                    ) : (
                        <IconVolume className="h-4 w-4 text-white" />
                    )
                }
            </div>
            <Slider
                value={volume}
                onChange={onVolumeChange}
                className="w-24 [&_.ant-slider-handle]:border-white [&_.ant-slider-rail]:bg-gray-800 [&_.ant-slider-track]:bg-white"
            />
        </div>
    );
};
