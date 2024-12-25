import { Button, List } from 'antd';
import { SearchOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Music } from '@/types/music';
import Image from 'next/image';

interface MusicQueueProps {
    queue: Music[];
    onSearchClick: () => void;
    onMusicSelect?: (music: Music) => void;
}

export const MusicQueue = ({ queue, onSearchClick, onMusicSelect }: MusicQueueProps) => {
    return (
        <div className="w-80 flex-none">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Up Next</h3>
            </div>

            <div className="space-y-4">
                <Button
                    onClick={onSearchClick}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-white/10 py-2 text-white hover:bg-white/20"
                    icon={<SearchOutlined />}
                >
                    Search Music
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
                                        src={`https://img.youtube.com/vi/${music.snippet.thumbnails.default.url}`}
                                        alt={music.snippet.title}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 truncate">
                                    <div className="font-medium">{music.snippet.title}</div>
                                    <div className="text-sm text-gray-400">{music.snippet.channelTitle}</div>
                                </div>
                                <EllipsisOutlined className="hidden text-gray-400 group-hover:block" />
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