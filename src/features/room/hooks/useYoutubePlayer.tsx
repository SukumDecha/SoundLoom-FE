// import { useState, useEffect, useRef } from 'react'
// import YouTube from 'react-youtube'

// export function useYouTubePlayer(videoId: string | null) {
//   const [player, setPlayer] = useState<any>(null)
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [progress, setProgress] = useState(0)
//   const [duration, setDuration] = useState(0)
//   const progressInterval = useRef<NodeJS.Timeout | null>(null)

//   useEffect(() => {
//     return () => {
//       if (progressInterval.current) {
//         clearInterval(progressInterval.current)
//       }
//     }
//   }, [])

//   const onReady = (event: { target: any }) => {
//     setPlayer(event.target)
//     setDuration(event.target.getDuration())
//   }

//   const togglePlayPause = () => {
//     if (player) {
//       if (isPlaying) {
//         player.pauseVideo()
//       } else {
//         player.playVideo()
//       }
//       setIsPlaying(!isPlaying)
//     }
//   }

//   const onStateChange = (event: { data: number }) => {
//     if (event.data === YouTube.PlayerState.PLAYING) {
//       setIsPlaying(true)
//       progressInterval.current = setInterval(() => {
//         setProgress((player.getCurrentTime() / player.getDuration()) * 100)
//       }, 1000)
//     } else {
//       setIsPlaying(false)
//       if (progressInterval.current) {
//         clearInterval(progressInterval.current)
//       }
//     }
//   }

//   const seekTo = (percent: number) => {
//     if (player) {
//       const seekTime = (percent / 100) * duration
//       player.seekTo(seekTime, true)
//     }
//   }

//   return {
//     player,
//     isPlaying,
//     progress,
//     duration,
//     onReady,
//     togglePlayPause,
//     onStateChange,
//     seekTo,
//   }
// }
