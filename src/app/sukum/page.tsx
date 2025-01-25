'use client'

import useSocketRoom from "@/features/room/hooks/useSocketRoom"
import { useNotificationStore } from "@/features/shared/stores/notification.store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const page = () => {
    const { deleteAllRooms, socket } = useSocketRoom()

    const openNotification = useNotificationStore(
        (state) => state.openNotification
    )

    const router = useRouter()

    useEffect(() => {
        if (!socket) {
            console.error('Socket not initialized')
            return
        }

        const deleteRooms = async () => {
            await deleteAllRooms()

            console.log("Deleted all rooms", deleteAllRooms)

            openNotification({
                type: 'success',
                message: 'All rooms deleted successfully',
                description: 'You have deleted all rooms',
            })

            setTimeout(() => {
                router.push('/')
            }, 3000)
        }

        deleteRooms()
    }, [socket])

    return (
        <div>Redirecting in 3 seconds...</div>
    )
}

export default page