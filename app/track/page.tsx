'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Download, Phone, Search } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import StatusBadge from '@/components/StatusBadge';
import Tracker from '@/components/Tracker';
import Stars from '@/components/Stars';
import { api, downloadFile, naira } from '@/lib/api';

const SAVED = 'ka_bookings';
const HINT: Record<string, string> = {
  pending: 'Waiting for the branch to confirm your booking.',
  confirmed: 'Your booking is confirmed. We look forward to seeing you!',
  checked_in: 'You are checked in. Enjoy your stay!',
  checked_out: 'Thank you for staying with us.',
  cancelled: 'This booking was cancelled.',
};
type Proof = { t?: string; phone?: string };
const qs = (p: Proof) => (p.t ? `t=${encodeURIComponent(p.t)}` : `phone=${encodeURIComponent(p.phone || '')}`);

export default function Track() {
  const [b, setB] = useState<any>(null);
  const [proof, setProof] = useState<Proof>({});
  const [look, setLook] = useState({ ref: '', phone: '' });
  const [saved, setSaved] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [note, setNote] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const open = useCallback(async (ref: string, p: Proof, payref?: string) => {
    setMsg('');
    try {
      const d = await api(`/track/${encodeURIComponent(ref)}${payref ? `/verify?payref=${encodeURIComponent(payref)}&` : '?'}${qs(p)}`);
      setB(d); setProof(p);
      if (p.t) { // remember it on this device
        try { const old = JSON.parse(localStorage.getItem(SAVED) || '[]').filter((x: any) => x.ref !== d.reference); localStorage.setItem(SAVED, JSON.stringify([{ ref: d.reference, t: p.t, name: d.roomType, at: Date.now() }, ...old].slice(0, 10))); } catch {}
      }
    } catch (e: any) { setMsg(e.message); }
  }, []);

  useEffect(() => {
    try { setSaved(JSON.parse(localStorage.getItem(SAVED) || '[]')); } catch {}
    const q = new URLSearchParams(location.search);
    const ref = q.get('ref'), t = q.get('t'), payref = q.get('reference') || q.get('trxref');
    if (q.get('new')) setNote('Booking received! We have sent the details to your phone by SMS. Pay online to secure your room and unlock your check-in ticket.');
    if (ref && t) open(ref, { t }, payref || undefined).then(() => { if (payref) setNote('Thank you! We are confirming your payment.'); history.replaceState(null, '', `/track?ref=${ref}&t=${t}`); });
  }, [open]);

  const act = async (path: string, body: any = {}) => {
    setMsg('');
    try { return await api(`/track/${b.reference}/${path}`, { method: 'POST', body: JSON.stringify({ ...proof, ...body }) }); } catch (e: any) { setMsg(e.message); return null; }
  };
  const pay = async () => { const d = await act('pay'); if (d?.url) location.href = d.url; };
  const ticket = () => downloadFile(`/track/${b.reference}/ticket.pdf?${qs(proof)}`, `kings-apartment-ticket-${b.reference}.pdf`).catch((e) => setMsg(e.message));
  const cancel = async () => { if (!confirm('Cancel this booking?')) return; const d = await act('cancel'); if (d) setB(d); };
  const review = async (e: React.FormEvent) => { e.preventDefault(); const d = await act('review', { rating, comment: comment || undefined }); if (d) setB(d); };

  return (
    <div className="min-h-screen bg-navy-50">
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="text-3xl">Track your booking</h1>
        {msg && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
        {note && <p role="status" className="mt-4 rounded-xl bg-gold-soft p-3 text-sm">{note}</p>}

        {!b && (
          <>
            <form onSubmit={(e) => { e.preventDefault(); open(look.ref.trim(), { phone: look.phone }); }} className="card mt-6 space-y-3">
              <p className="text-sm text-navy/60">Enter the booking reference from your SMS and the phone number you booked with.</p>
              <input className="input" required placeholder="Booking reference, e.g. KA-ABC123" value={look.ref} onChange={(e) => setLook({ ...look, ref: e.target.value.toUpperCase() })} />
              <input className="input" required type="tel" inputMode="tel" placeholder="Phone number" value={look.phone} onChange={(e) => setLook({ ...look, phone: e.target.value })} />
              <button className="btn-gold"><Search size={16} className="mr-2" />Find my booking</button>
            </form>
            {saved.length > 0 && (
              <section className="mt-8"><h2 className="mb-3 text-xl">Recent bookings on this device</h2>
                <ul className="space-y-2">{saved.map((s) => <li key={s.ref}><button className="card w-full text-left hover:bg-gold-soft" onClick={() => open(s.ref, { t: s.t })}><span className="font-medium">{s.ref}</span> <span className="text-sm text-navy/60">· {s.name}</span></button></li>)}</ul>
              </section>
            )}
            <p className="mt-8 text-sm text-navy/60">Want to make a booking? <Link className="underline" href="/book">Book a stay</Link></p>
          </>
        )}

        {b && (
          <div className="card mt-6 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div><p className="text-xs text-navy/50">{b.reference}</p><h2 className="text-2xl">{b.roomType} · {b.branch?.name}</h2><p className="text-sm text-navy/60">{b.branch?.address}</p></div>
              <div className="flex gap-2"><StatusBadge s={b.status} /><StatusBadge s={b.paymentStatus} /></div>
            </div>
            <p className="rounded-xl bg-navy-50 p-3 text-sm">{HINT[b.status]}</p>
            <Tracker status={b.status} />
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-navy/60">Guest</dt><dd>{b.guestName}</dd></div>
              <div><dt className="text-navy/60">Guests</dt><dd>{b.guests}</dd></div>
              <div><dt className="text-navy/60">Check in</dt><dd>{new Date(b.checkIn).toLocaleDateString('en-NG', { dateStyle: 'full', timeZone: 'UTC' })} from {b.branch?.checkInTime || '14:00'}</dd></div>
              <div><dt className="text-navy/60">Check out</dt><dd>{new Date(b.checkOut).toLocaleDateString('en-NG', { dateStyle: 'full', timeZone: 'UTC' })} by {b.branch?.checkOutTime || '12:00'}</dd></div>
              {b.room && <div><dt className="text-navy/60">Room</dt><dd>{b.room}</dd></div>}
            </dl>
            <dl className="space-y-1 border-t border-navy/10 pt-4 text-sm">
              <div className="flex justify-between"><dt>{b.nights} night{b.nights === 1 ? '' : 's'}</dt><dd>{naira(b.subtotal)}</dd></div>
              {b.stayDiscount > 0 && <div className="flex justify-between text-emerald-700"><dt>{b.stayDiscountPercent}% long-stay discount</dt><dd>-{naira(b.stayDiscount)}</dd></div>}
              {b.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Coupon {b.couponCode}</dt><dd>-{naira(b.discount)}</dd></div>}
              <div className="flex justify-between text-lg"><dt>Total</dt><dd>{naira(b.total)}</dd></div>
            </dl>
            {b.status !== 'cancelled' && (b.paymentStatus === 'paid' ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/50 bg-gold-soft p-4">
                <p className="text-sm"><b>Your check-in ticket is ready.</b> Download it and show it at reception, printed or on your phone.</p>
                <button className="btn-gold" onClick={ticket}><Download size={16} className="mr-2" />Download ticket (PDF)</button>
              </div>
            ) : (
              <p className="rounded-xl border border-navy/15 bg-navy-50 p-4 text-sm"><b>Your check-in ticket unlocks once your payment is received.</b> Use the Pay button below to pay online.</p>
            ))}
            <div className="flex flex-wrap gap-2">
              {b.paymentStatus === 'unpaid' && b.status !== 'cancelled' && <button className="btn-gold" onClick={pay}>Pay {naira(b.total)} online</button>}
              {['pending', 'confirmed'].includes(b.status) && <button className="btn-ghost" onClick={cancel}>Cancel booking</button>}
              {b.branch?.phone && <a className="btn-ghost" href={`tel:${b.branch.phone}`}><Phone size={16} className="mr-2" />Call the branch</a>}
            </div>
            {b.status === 'checked_out' && !b.reviewed && (
              <form onSubmit={review} className="space-y-2 rounded-xl bg-navy-50 p-4">
                <p className="text-sm font-medium">How was your stay?</p><Stars value={rating} onChange={setRating} />
                <textarea className="input" rows={2} maxLength={1000} placeholder="Tell other guests what you liked (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
                <button className="btn-gold" disabled={!rating}>Post review</button>
              </form>
            )}
            {b.status === 'checked_out' && b.reviewed && <p className="text-sm text-navy/60">Thanks for reviewing your stay.</p>}
            <Link href="/book" className="text-sm underline">Make another booking</Link>
          </div>
        )}
      </main>
    </div>
  );
}
