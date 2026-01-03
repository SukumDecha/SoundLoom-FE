# SoundLoom

Real-time collaborative music listening experience.

## Status

**Inactive** — Core features completed. Built to learn WebSocket-based real-time synchronization.

## Tech Stack

- Next.js 14 (App Router)
- Socket.io Client
- Zustand (State Management)
- Ant Design + Tailwind CSS
- Docker

## Engineering Highlights

- **Singleton Socket Pattern** — Centralized WebSocket connection management with automatic reconnection
- **Feature-based Architecture** — Organized by domain (room, music, shared) for scalability
- **Real-time State Sync** — Room state synchronized across all connected clients via Socket.io events
- **Custom Hooks** — Encapsulated socket logic (`useSocketRoom`, `usePlaybackState`, `useYoutubePlayer`)

## Quick Start

```bash
# Development
npm install
npm run dev

# With Docker
docker-compose -f docker-compose.dev.yml up --build
```
