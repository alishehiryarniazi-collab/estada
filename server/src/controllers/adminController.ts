import type { Request, Response } from 'express';
import * as admin from '../services/adminService.js';

export async function verifications(_req: Request, res: Response) {
  res.json({ items: await admin.listPendingVerifications() });
}
export async function reviewVerification(req: Request, res: Response) {
  await admin.reviewVerification(req.params.id, req.body.status);
  res.json({ ok: true });
}
export async function reports(_req: Request, res: Response) {
  res.json({ items: await admin.listReports() });
}
export async function reviewReport(req: Request, res: Response) {
  await admin.reviewReport(req.params.id, req.body.status, req.body.takeDown === true);
  res.json({ ok: true });
}
export async function users(_req: Request, res: Response) {
  res.json({ items: await admin.listUsers() });
}
export async function verifyDealer(req: Request, res: Response) {
  await admin.verifyDealer(req.params.id, req.body.status);
  res.json({ ok: true });
}
