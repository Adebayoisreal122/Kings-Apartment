import { api } from './api';
const toKey = (b64: string) => {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
};
// Ask permission, subscribe this browser, and register it with the API.
export async function enablePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) throw new Error('This browser does not support push alerts. On iPhone, add the app to your Home Screen first.');
  if ((await Notification.requestPermission()) !== 'granted') throw new Error('Alerts are blocked. Allow notifications in your browser settings.');
  const { key } = await api('/push/public-key');
  if (!key) throw new Error('Push alerts are not set up on the server yet.');
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toKey(key) });
  await api('/push/subscribe', { method: 'POST', body: JSON.stringify(sub) });
}
