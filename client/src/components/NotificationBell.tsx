/**
 * Navbar bell to enable/disable browser push notifications. Only shows for
 * logged-in users on browsers that support push.
 */
import { useEffect, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { pushSupported, getSubscription, subscribeToPush, unsubscribeFromPush } from '../services/pushService';

export default function NotificationBell({ onDark = true }: { onDark?: boolean }) {
  const user = useAuthStore((s) => s.user);
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && pushSupported()) getSubscription().then((s) => setOn(!!s));
  }, [user]);

  if (!user || !pushSupported()) return null;

  const toggle = async () => {
    setBusy(true);
    try {
      if (on) {
        await unsubscribeFromPush();
        setOn(false);
      } else {
        setOn(await subscribeToPush());
      }
    } finally {
      setBusy(false);
    }
  };

  const color = onDark ? 'text-white/90 hover:text-white' : 'text-ink hover:text-primary';
  return (
    <button
      onClick={toggle}
      disabled={busy}
      title={on ? 'Notifications on — click to turn off' : 'Enable notifications'}
      className={`rounded-lg px-2.5 py-2 ${color}`}
    >
      {on ? <BellRing size={16} /> : <Bell size={16} />}
    </button>
  );
}
