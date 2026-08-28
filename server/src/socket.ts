/**
 * Socket.IO real-time layer for chat.
 *
 * Auth reuses the same httpOnly JWT cookie as the REST API (parsed from the
 * handshake). Clients join a per-enquiry room; messages are persisted to the DB
 * (so offline users see them on next load) AND broadcast to the room for
 * instant delivery.
 */
import type { Server as HttpServer } from 'node:http';
import { Server, type Socket } from 'socket.io';
import type { Role } from '@prisma/client';
import { env } from './config/env.js';
import { verifyToken } from './utils/jwt.js';
import { AUTH_COOKIE } from './utils/cookies.js';
import * as chat from './services/chatService.js';

let io: Server | null = null;

export const enquiryRoom = (enquiryId: string) => `enquiry:${enquiryId}`;
export const getIO = () => io;

function userFromCookie(socket: Socket): { userId: string; role: Role } | null {
  const raw = socket.handshake.headers.cookie;
  if (!raw) return null;
  const match = raw.split(';').map((c) => c.trim().split('='));
  const token = match.find(([k]) => k === AUTH_COOKIE)?.[1];
  if (!token) return null;
  try {
    return verifyToken(decodeURIComponent(token));
  } catch {
    return null;
  }
}

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: env.CLIENT_URL.split(',').map((o) => o.trim()), credentials: true },
  });

  // Reject unauthenticated sockets.
  io.use((socket, next) => {
    const user = userFromCookie(socket);
    if (!user) return next(new Error('Unauthorized'));
    socket.data.user = user;
    next();
  });

  io.on('connection', (socket) => {
    const userId: string = socket.data.user.userId;

    // Join a conversation room (only if the user is a participant).
    socket.on('join', async (enquiryId: string, ack?: (ok: boolean) => void) => {
      try {
        await chat.loadParticipant(enquiryId, userId);
        socket.join(enquiryRoom(enquiryId));
        ack?.(true);
      } catch {
        ack?.(false);
      }
    });

    socket.on('leave', (enquiryId: string) => socket.leave(enquiryRoom(enquiryId)));

    // Send a message: persist + broadcast to the room.
    socket.on('message', async (payload: { enquiryId: string; content: string }) => {
      try {
        const msg = await chat.createMessage(payload.enquiryId, userId, payload.content);
        io?.to(enquiryRoom(payload.enquiryId)).emit('message', { ...msg, enquiryId: payload.enquiryId });
      } catch {
        socket.emit('error-message', 'Could not send message.');
      }
    });
  });

  return io;
}
