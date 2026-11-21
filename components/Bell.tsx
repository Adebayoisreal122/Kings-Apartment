'use client';
import { useEffect, useState } from 'react';
import { Bell as BellIcon } from 'lucide-react';
import { io } from 'socket.io-client';
import { API, api, getToken } from '@/lib/api';

function beep() {
  try {
    const c = new AudioContext(); const o = c.createOscillator(); const g = c.createGain();
    o.frequency.value = 880; g.gain.value = 0.08; o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + 0.18);
  } catch {}
}
type N = { _id: string; title: string; message: string; read: boolean; createdAt: string };
export default function Bell() {
  const [items, setItems] = useState<N[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    api('/notifications').then(setItems).catch(() => {});
    const s = io(API, { auth: { token: getToken() } });
    s.on('notification', (n: N) => { setItems((p) => [n, ...p]); beep(); });
    return () => { s.disconnect(); };
  }, []);
  const unread = items.filter((i) => !i.read).length;
  const toggle = async () => {
    setOpen(!open);
    if (!open && unread) { await api('/notifications/read-all', { method: 'PATCH' }); setItems((p) => p.map((i) => ({ ...i, read: true }))); }
  };
  return (
    <div className="relative">
      <button onClick={toggle} aria-label={`Notifications, ${unread} new`} className="relative rounded-full p-2 hover:bg-navy-50">
        <BellIcon size={20} />
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-semibold">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 max-h-96 w-80 overflow-auto rounded-2xl border border-navy/10 bg-white shadow-xl">
          {items.length === 0 && <p className="p-4 text-sm text-navy/60">No notifications yet.</p>}
          {items.map((n) => (
            <div key={n._id} className="border-b border-navy/5 p-4 last:border-0">
              <p className="text-sm font-medium">{n.title}</p>
              <p className="text-sm text-navy/70">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
