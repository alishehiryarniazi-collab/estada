/**
 * A short "why Estada" strip — reinforces the trust positioning that sets the
 * brand apart. Green icons here are intentional: they signal trust/verification.
 */
import { ShieldCheck, MapPinOff, MessagesSquare, BadgeCheck } from 'lucide-react';

const ITEMS = [
  {
    Icon: BadgeCheck,
    title: 'Document verified',
    text: 'Dealers upload ownership proof; our team reviews before the badge shows.',
  },
  {
    Icon: MapPinOff,
    title: 'Address stays private',
    text: 'Exact location is hidden until you make an enquiry — no random visitors.',
  },
  {
    Icon: MessagesSquare,
    title: 'Chat before you share',
    text: 'Message dealers in-app; phone numbers reveal only when you both agree.',
  },
  {
    Icon: ShieldCheck,
    title: 'Report fraud',
    text: 'Every listing has a report button that sends it straight to moderation.',
  },
];

export default function TrustStrip() {
  return (
    <section className="border-y border-hairline bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {ITEMS.map(({ Icon, title, text }) => (
          <div key={title} className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-verify-light text-verify">
              <Icon size={20} />
            </span>
            <div>
              <h3 className="text-body font-medium text-ink">{title}</h3>
              <p className="mt-0.5 text-sm text-ink-muted">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
