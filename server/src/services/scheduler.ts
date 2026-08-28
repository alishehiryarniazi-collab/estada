/**
 * Background jobs. Currently: auto-expire listings older than 30 days and email
 * the dealer a renewal reminder. Runs once on boot, then hourly.
 *
 * (For production you'd move this to a real cron/queue; setInterval is fine for
 * a single-instance dev/demo server.)
 */
import { prisma } from '../config/prisma.js';
import { sendMail } from './mailService.js';

async function expireOverdueListings() {
  const now = new Date();
  const overdue = await prisma.property.findMany({
    where: { status: 'active', isDraft: false, expiresAt: { lt: now } },
    select: { id: true, title: true, dealer: { select: { email: true } } },
  });

  for (const p of overdue) {
    await prisma.property.update({ where: { id: p.id }, data: { status: 'expired' } });
    sendMail(
      p.dealer.email,
      `Listing expired: ${p.title}`,
      'Your listing has expired',
      `<p>Your listing <strong>${p.title}</strong> reached its 30-day limit and is no longer shown in search.</p>
       <p>Open your Estada dashboard and hit <strong>Renew</strong> to make it active again for another 30 days.</p>`,
    );
  }
  if (overdue.length) console.info(`⏰ Auto-expired ${overdue.length} listing(s).`);
}

export function startSchedulers() {
  const run = () => expireOverdueListings().catch((e) => console.error('Scheduler error:', e));
  run(); // on boot
  setInterval(run, 60 * 60 * 1000); // hourly
}
