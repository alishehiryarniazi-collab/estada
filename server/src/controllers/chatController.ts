import type { Request, Response } from 'express';
import * as chat from '../services/chatService.js';
import { getIO, enquiryRoom } from '../socket.js';

export async function myThreads(req: Request, res: Response) {
  res.json({ threads: await chat.listThreads(req.user!.userId) });
}

export async function threadMessages(req: Request, res: Response) {
  res.json(await chat.getMessages(req.params.id, req.user!.userId));
}

export async function postMessage(req: Request, res: Response) {
  const message = await chat.createMessage(req.params.id, req.user!.userId, req.body.content);
  // Real-time: push to everyone in the room (delivered instantly if online).
  getIO()?.to(enquiryRoom(req.params.id)).emit('message', { ...message, enquiryId: req.params.id });
  res.status(201).json({ message });
}

export async function sharePhone(req: Request, res: Response) {
  const result = await chat.sharePhone(req.params.id, req.user!.userId);
  // Notify the other party that phone-share state changed.
  getIO()?.to(enquiryRoom(req.params.id)).emit('phone-updated', result.phone);
  res.json(result);
}
