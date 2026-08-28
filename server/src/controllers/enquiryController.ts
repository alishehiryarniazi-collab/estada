import type { Request, Response } from 'express';
import * as enquiryService from '../services/enquiryService.js';

export async function submitEnquiry(req: Request, res: Response) {
  const enquiry = await enquiryService.createEnquiry(req.user!.userId, req.body);
  res.status(201).json({ enquiry });
}

export async function reportProperty(req: Request, res: Response) {
  const report = await enquiryService.createReport(
    req.user!.userId,
    req.params.id,
    req.body.reason,
  );
  res.status(201).json({ report });
}
