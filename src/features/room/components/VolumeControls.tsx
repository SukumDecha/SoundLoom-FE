import { Slider } from 'antd';
import { SoundOutlined } from '@ant-design/icons';

interface VolumeControlsProps {
    volume: number;
    onVolumeChange: (value: number) => void;
}

export const VolumeControls = ({ volume, onVolumeChange }: VolumeControlsProps) => {
    return (
        <div className="flex items-center gap-2">
            <SoundOutlined />
            <Slider
                value={volume}
                onChange={onVolumeChange}
                className="w-24 [&_.ant-slider-handle]:border-white [&_.ant-slider-rail]:bg-gray-800 [&_.ant-slider-track]:bg-white"
            />
        </div>
    );
};
