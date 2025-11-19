import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export function getSocket(): Socket | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      path: '/api/socket',
    })
  }

  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

