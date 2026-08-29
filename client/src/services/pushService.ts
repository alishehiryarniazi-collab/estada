/**
 * Browser push subscription helpers. Push works only in a secure context
 * (HTTPS or localhost) and when the service worker is registered.
 */
import { api } from '../lib/api';

export function pushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(normalized);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function getVapidKey(): Promise<string | null> {
  const { data } = await api.get<{ key: string | null }>('/push/public-key');
  return data.key;
}

export async function getSubscription(): Promise<PushSubscription | null> {
  if (!pushSupported()) return null;
  const reg = await navigator.serviceWorker.ready;
  return reg.pushManager.getSubscription();
}

/** Ask permission + subscribe + register with the API. Returns true on success. */
export async function subscribeToPush(): Promise<boolean> {
  if (!pushSupported()) return false;
  const key = await getVapidKey();
  if (!key) return false; // push not configured on the server

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ||
    (await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key) as BufferSource,
    }));

  await api.post('/push/subscribe', sub.toJSON());
  return true;
}

export async function unsubscribeFromPush(): Promise<void> {
  const sub = await getSubscription();
  if (!sub) return;
  await api.post('/push/unsubscribe', { endpoint: sub.endpoint }).catch(() => undefined);
  await sub.unsubscribe();
}
