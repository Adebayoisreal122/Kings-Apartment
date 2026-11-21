'use client';
import { useEffect, useState } from 'react';
import { enablePush } from '@/lib/push';
export default function PushToggle() {
  const [on, setOn] = useState(true); // hidden until we know alerts are off
  const [err, setErr] = useState('');
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    navigator.serviceWorker.ready.then((r) => r.pushManager.getSubscription()).then((s) => setOn(!!s && Notification.permission === 'granted')).catch(() => {});
  }, []);
  if (on) return null;
  return (
    <div className="flex items-center gap-2">
      {err && <span role="alert" className="max-w-52 text-xs text-red-700">{err}</span>}
      <button className="btn-gold !px-3 !py-1.5 text-xs" onClick={async () => { try { await enablePush(); setOn(true); } catch (e: any) { setErr(e.message); } }}>Turn on alerts</button>
    </div>
  );
}
