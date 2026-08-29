/**
 * Share a listing — WhatsApp (huge in Pakistan) + copy-link. Sharing a listing
 * link never exposes anyone's phone number, so it fits our privacy stance.
 */
import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);
  const waText = encodeURIComponent(`${title}\nView on Estada: ${url}`);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* WhatsApp brand green (#25D366) — deliberate 3rd-party brand colour. */}
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 text-sm font-medium text-white hover:brightness-95"
      >
        <WhatsAppIcon /> WhatsApp
      </a>
      <button
        onClick={copy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas"
      >
        {copied ? <Check size={15} className="text-verify" /> : <Link2 size={15} />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.47 14.38c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35zM12.04 2.5a9.5 9.5 0 0 0-8.1 14.46L2.5 21.5l4.66-1.4a9.5 9.5 0 1 0 4.88-17.6zm0 17.36c-1.48 0-2.93-.4-4.19-1.15l-.3-.18-2.77.83.83-2.7-.2-.31a7.86 7.86 0 1 1 6.63 3.68z" />
    </svg>
  );
}
