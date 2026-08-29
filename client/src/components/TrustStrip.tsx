/**
 * A short "why Estada" strip — reinforces the trust positioning that sets the
 * brand apart. Green icons here are intentional: they signal trust/verification.
 */
import { ShieldCheck, MapPinOff, MessagesSquare, BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ITEMS = [
  { Icon: BadgeCheck, key: 'trust.docVerified' },
  { Icon: MapPinOff, key: 'trust.privacy' },
  { Icon: MessagesSquare, key: 'trust.chat' },
  { Icon: ShieldCheck, key: 'trust.report' },
];

export default function TrustStrip() {
  const { t } = useTranslation();
  return (
    <section className="border-y border-hairline bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {ITEMS.map(({ Icon, key }) => (
          <div key={key} className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-verify-light text-verify">
              <Icon size={20} />
            </span>
            <div>
              <h3 className="text-body font-medium text-ink">{t(`${key}.title`)}</h3>
              <p className="mt-0.5 text-sm text-ink-muted">{t(`${key}.text`)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
