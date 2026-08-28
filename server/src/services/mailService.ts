/**
 * Email sending (Nodemailer). If real SMTP creds are set in .env we use them;
 * otherwise we auto-create an Ethereal test inbox (dev) and log a preview URL
 * so emails are visible without configuring anything.
 *
 * All sends are best-effort: a mail failure must never break the API request
 * that triggered it, so callers don't await/throw on these.
 */
import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env.js';

let transporterPromise: Promise<Transporter> | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporterPromise) return transporterPromise;
  transporterPromise = (async () => {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      return nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      });
    }
    const test = await nodemailer.createTestAccount();
    console.info(`✉️  Email: using Ethereal test inbox (${test.user})`);
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: test.user, pass: test.pass },
    });
  })();
  return transporterPromise;
}

/** Wraps content in a simple branded shell (logo + footer). */
function template(title: string, body: string): string {
  return `
  <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#FAFAF8;padding:24px;border-radius:12px;color:#1A1A1A">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
      <span style="display:inline-grid;place-items:center;width:32px;height:32px;background:#0F2A47;border-radius:8px;color:#fff;font-weight:700">E</span>
      <span style="font-size:20px;font-weight:700;color:#0F2A47">Estada</span>
    </div>
    <h1 style="font-size:18px;margin:0 0 12px">${title}</h1>
    <div style="font-size:14px;line-height:1.6;color:#333">${body}</div>
    <hr style="border:none;border-top:1px solid #E5E4DE;margin:20px 0" />
    <p style="font-size:12px;color:#6B6B66;margin:0">You're receiving this from Estada — verified property in Pakistan.</p>
  </div>`;
}

export async function sendMail(to: string, subject: string, title: string, bodyHtml: string) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: env.MAIL_FROM,
      to,
      subject,
      html: template(title, bodyHtml),
    });
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.info(`✉️  Sent "${subject}" -> ${to} | preview: ${preview}`);
    return preview || null;
  } catch (err) {
    console.error('Email send failed:', err);
    return null;
  }
}
