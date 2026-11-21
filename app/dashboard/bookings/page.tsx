'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { CalendarCheck } from 'lucide-react';
import Shell from '@/components/Shell';
import StatusBadge from '@/components/StatusBadge';
import Tracker from '@/components/Tracker';
import ReviewForm from '@/components/ReviewForm';
import { api, naira } from '@/lib/api';

export default function MyBookings() {
  const [mine, setMine] = useState<any[] | null>(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(() => api('/bookings/mine').then(setMine).catch((e) => setMsg(e.message)), []);
  useEffect(() => {
    const ref = new URLSearchParams(location.search).get('reference');
    if (ref) api(`/payments/verify/${ref}`).then(() => { setMsg('Payment received. Thank you!'); history.replaceState(null, '', '/dashboard/bookings'); load(); }).catch((e) => setMsg(e.message));
    load();
  }, [load]);
  const pay = async (id: string) => { try { const d = await api('/payments/initialize', { method: 'POST', body: JSON.stringify({ bookingId: id }) }); location.href = d.authorization_url; } catch (e: any) { setMsg(e.message); } };
  const cancel = async (id: string) => { if (!confirm('Cancel this booking?')) return; await api(`/bookings/${id}/cancel`, { method: 'PATCH' }).catch((e) => setMsg(e.message)); load(); };
  return (
    <Shell role="customer" title="My bookings" subtitle="Follow each stay from booking to check-out">
      {msg && <p role="status" className="mb-4 rounded-xl bg-gold-soft p-3 text-sm">{msg}</p>}
      <div className="space-y-4">
        {mine && mine.length === 0 && (
          <div className="card py-12 text-center"><CalendarCheck className="mx-auto mb-3 text-gold-muted" size={32} /><p className="text-navy/70">You have no bookings yet.</p><Link href="/dashboard" className="btn-gold mt-4">Book your first stay</Link></div>
        )}
        {mine?.map((b) => (
          <div key={b._id} className="card space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-xs text-navy/50">{b.reference}</p>
                <h3 className="text-xl">{b.roomType?.name} · {b.branch?.name}</h3>
                <p className="text-sm text-navy/60">{new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()} · {naira(b.total)}{b.discount > 0 && ` (saved ${naira(b.discount)} with ${b.couponCode})`}{b.room && ` · Room ${b.room.number}`}</p>
              </div>
              <div className="flex gap-2"><StatusBadge s={b.status} /><StatusBadge s={b.paymentStatus} /></div>
            </div>
            <Tracker status={b.status} />
            <div className="flex flex-wrap gap-2">
              {b.paymentStatus === 'unpaid' && b.status !== 'cancelled' && <button className="btn-gold" onClick={() => pay(b._id)}>Pay {naira(b.total)}</button>}
              {['pending', 'confirmed'].includes(b.status) && <button className="btn-ghost" onClick={() => cancel(b._id)}>Cancel booking</button>}
            </div>
            {b.status === 'checked_out' && !b.reviewed && <ReviewForm booking={b._id} onDone={load} />}
            {b.status === 'checked_out' && b.reviewed && <p className="text-sm text-navy/60">Thanks for reviewing this stay.</p>}
          </div>
        ))}
      </div>
    </Shell>
  );
}
