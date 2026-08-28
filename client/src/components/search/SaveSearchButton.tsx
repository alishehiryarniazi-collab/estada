/**
 * "Save this search" — stores the current filters so the buyer can get alerts
 * (email digest wiring lands in M5). Prompts login if needed.
 */
import { useState } from 'react';
import { BellPlus, Check } from 'lucide-react';
import { createSavedSearch } from '../../services/savedService';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

export default function SaveSearchButton({ params }: { params: Record<string, string> }) {
  const user = useAuthStore((s) => s.user);
  const openAuth = useUiStore((s) => s.openAuth);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (!user) return openAuth('login');
    setBusy(true);
    try {
      await createSavedSearch(params);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-hairline bg-white px-3 py-1.5 text-sm font-medium text-ink hover:bg-canvas disabled:opacity-60"
    >
      {saved ? <Check size={15} className="text-verify" /> : <BellPlus size={15} />}
      {saved ? 'Saved' : 'Save search'}
    </button>
  );
}
