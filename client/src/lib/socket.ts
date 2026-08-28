/**
 * Shared Socket.IO client. Connects to the same origin (Vite proxies /socket.io
 * to the API in dev) and sends the auth cookie. One socket for the whole app.
 */
import { io, type Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io({ withCredentials: true, transports: ['websocket', 'polling'] });
  }
  return socket;
}
