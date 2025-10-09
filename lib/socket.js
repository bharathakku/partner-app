import { io } from 'socket.io-client'

let socket = null

export function connectSocket() {
  if (socket && socket.connected) return socket
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001/api'
  const wsBase = apiBase.replace(/\/?api\/?$/, '')
  socket = io(wsBase, { withCredentials: true, transports: ['websocket'], reconnection: true })
  return socket
}

export function emitDriverLocation({ orderId, lat, lng, heading, speed }) {
  if (!socket) return
  socket.emit('driver-location', { orderId, lat, lng, heading, speed })
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Driver assignment helpers
export function joinDriverRoom(driverId) {
  if (!socket || !driverId) return
  socket.emit('join-driver', driverId)
}

export function leaveDriverRoom(driverId) {
  if (!socket || !driverId) return
  socket.emit('leave-driver', driverId)
}

export function onOrderAssigned(handler) {
  if (!socket) return () => {}
  socket.on('order-assigned', handler)
  return () => socket.off('order-assigned', handler)
}

// Chat helpers
export function joinChatThread(threadId) {
  if (!socket) return
  socket.emit('chat:join', threadId)
}

export function leaveChatThread(threadId) {
  if (!socket) return
  socket.emit('chat:leave', threadId)
}

export function onChatMessage(handler) {
  if (!socket) return () => {}
  socket.on('chat:message', handler)
  return () => socket.off('chat:message', handler)
}

export function emitChatMessage(threadId, message) {
  if (!socket) return
  socket.emit('chat:message', { threadId, message })
}

export function onChatRead(handler) {
  if (!socket) return () => {}
  socket.on('chat:read', handler)
  return () => socket.off('chat:read', handler)
}
