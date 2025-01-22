import { Button, List, Tooltip } from 'antd';
import { SearchOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Music } from '@/types/music';
import Image from 'next/image';
import MusicQueueDropdown from './modals/MusicQueueDropdown';

interface MusicQueueProps {
    queue: Music[];
    onSearch: () => void;
    onMusicSelect?: (music: Music) => void;
}

export const MusicQueue = ({ queue, onSearch, onMusicSelect }: MusicQueueProps) => {
    return (
        <div className="w-80 flex-none">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Up Next</h3>
            </div>

            <div className="space-y-4">
                <Button
                    onClick={onSearch}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white/10 py-2 text-white hover:bg-white/20"
                >
                    <span><SearchOutlined className="mr-1" /> Search Music</span>
                </Button>

                {queue.length > 0 ? (
                    <List
                        dataSource={queue}
                        renderItem={(music: Music) => (
                            <div
                                className="group flex items-center gap-3 rounded-lg p-2 hover:bg-white/5"
                                onClick={() => onMusicSelect?.(music)}
                            >
                                <div className="h-12 w-12 flex-none overflow-hidden rounded-md bg-gray-800">
                                    <Image
                                        width={48}
                                        height={48}
                                        src={music.snippet.thumbnails.default.url}
                                        alt={music.snippet.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 truncate">
                                    <div className="font-medium">{music.snippet.title}</div>
                                    <div className="text-sm text-gray-400">{music.snippet.channelTitle}</div>
                                </div>
                                <MusicQueueDropdown musicId={music.id.videoId}>
                                    <EllipsisOutlined className="text-gray-400 group-hover:text-white group-hover:cursor-pointer" />
                                </MusicQueueDropdown>
                            </div>
                        )}
                    />
                ) : (
                    <div className="text-center text-gray-400">The queue is empty</div>
                )}
            </div>
        </div>
    );
};