'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag } from 'lucide-react';
import PublicHeader from '@/components/PublicHeader';
import Stars from '@/components/Stars';
import { api, naira } from '@/lib/api';

const today = () => new Date().toISOString().slice(0, 10);
const plus = (d: string, n: number) => new Date(+new Date(d) + n * 864e5).toISOString().slice(0, 10);
const SAVED = 'ka_bookings';

export default function Book() {
  const router = useRouter();
  const [branches, setBranches] = useState<any[]>([]);
  const [branchId, setBranchId] = useState('');
  const [branch, setBranch] = useState<any>(null);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [checkIn, setCheckIn] = useState(today());
  const [checkOut, setCheckOut] = useState(plus(today(), 1));
  const [guests, setGuests] = useState(1);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  const [sel, setSel] = useState<any | null>(null);
  const [f, setF] = useState({ name: '', phone: '', email: '', specialRequests: '' });
  const [busy, setBusy] = useState(false);

  useEffect(() => { // pick up the search from the homepage
    const q = new URLSearchParams(location.search);
    if (q.get('in') && q.get('in')! >= today()) setCheckIn(q.get('in')!);
    if (q.get('out') && q.get('out')! > (q.get('in') || today())) setCheckOut(q.get('out')!);
    if (q.get('guests')) setGuests(Math.max(1, +q.get('guests')! || 1));
    api('/branches/discounts/stay').then(setDiscounts).catch(() => {});
    api('/branches').then((b) => { setBranches(b); setBranchId(q.get('branch') && b.some((x: any) => x._id === q.get('branch')) ? q.get('branch')! : b[0]?._id || ''); });
  }, []);

  const search = useCallback(async (couponCode: string) => {
    if (!branchId) return;
    setMsg('');
    const b = await api(`/branches/${branchId}?checkIn=${checkIn}&checkOut=${checkOut}`);
    let list = b.roomTypes;
    if (couponCode) {
      list = await Promise.all(list.map(async (r: any) => {
        try { return { ...r, deal: await api('/coupons/validate', { method: 'POST', body: JSON.stringify({ code: couponCode, roomType: r._id, checkIn, checkOut }) }) }; }
        catch (e: any) { setMsg(e.message); return r; }
      }));
    }
    setBranch(b); setRooms(list); setApplied(couponCode); setSel(null);
  }, [branchId, checkIn, checkOut]);
  useEffect(() => { search(code.trim()).catch((e) => setMsg(e.message)); /* eslint-disable-next-line */ }, [branchId, checkIn, checkOut]);

  const promo = discounts.filter((d) => (!d.branch || d.branch._id === branchId)).sort((a, b) => b.percent - a.percent)[0];
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg('');
    try {
      const out = await api('/guest/bookings', { method: 'POST', body: JSON.stringify({ roomType: sel._id, checkIn, checkOut, guests, name: f.name, phone: f.phone, email: f.email || undefined, specialRequests: f.specialRequests || undefined, couponCode: sel.deal ? applied : undefined }) });
      try { const old = JSON.parse(localStorage.getItem(SAVED) || '[]'); localStorage.setItem(SAVED, JSON.stringify([{ ref: out.reference, t: out.accessToken, name: sel.name, at: Date.now() }, ...old].slice(0, 10))); } catch {}
      router.push(`/track?ref=${out.reference}&t=${out.accessToken}&new=1`);
    } catch (x: any) { setMsg(x.message); setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <h1 className="text-3xl">Book your stay</h1>
        <p className="mb-6 text-navy/60">No account needed. Choose a room, then give us your name and phone number.</p>
        {msg && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
        <div className="card mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="text-sm lg:col-span-2">Branch<select className="input mt-1" value={branchId} onChange={(e) => setBranchId(e.target.value)}>{branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}</select></label>
          <label className="text-sm">Check in<input className="input mt-1" type="date" min={today()} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); if (e.target.value >= checkOut) setCheckOut(plus(e.target.value, 1)); }} /></label>
          <label className="text-sm">Check out<input className="input mt-1" type="date" min={plus(checkIn, 1)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></label>
          <label className="text-sm">Guests<input className="input mt-1" type="number" min={1} max={6} value={guests} onChange={(e) => setGuests(+e.target.value || 1)} /></label>
          <form className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-5" onSubmit={(e) => { e.preventDefault(); search(code.trim()).catch((x) => setMsg(x.message)); }}>
            <input className="input max-w-xs" placeholder="Coupon code (optional)" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
            <button className="btn-ghost">Apply coupon</button>
            {applied && !msg && <span className="text-sm text-emerald-700">{applied} applied</span>}
          </form>
        </div>

        {promo && <p className="mb-6 flex items-center gap-2 rounded-2xl bg-gold-soft p-4 text-sm"><Tag size={18} className="shrink-0 text-gold-muted" /><span><b>Stay {promo.minNights} nights or more and save {promo.percent}%.</b> The discount is added automatically when you pick your dates.</span></p>}

        {branch && (
          <div className="card mb-6 flex flex-wrap items-center gap-4">
            {branch.images?.[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={branch.images[0]} alt="" className="h-24 w-36 rounded-xl object-cover" /> : <div className="flex h-24 w-36 items-center justify-center rounded-xl bg-navy text-xs tracking-[0.3em] text-gold">{(branch.area || branch.city)?.toUpperCase()}</div>}
            <div><h2 className="text-2xl">{branch.name}</h2><p className="text-sm text-navy/60">{branch.address}</p>
              {branch.rating ? <p className="text-sm"><Stars value={branch.rating} /> {branch.rating} · {branch.reviews} review{branch.reviews === 1 ? '' : 's'}</p> : <p className="text-sm text-navy/50">No reviews yet</p>}</div>
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          {rooms.map((r) => {
            const q = r.quote; const total = r.deal ? r.deal.total : q?.net ?? r.pricePerNight;
            return (
              <div key={r._id} className={`card overflow-hidden !p-0 ${sel?._id === r._id ? 'ring-2 ring-gold' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.images?.[0] || '/rooms/classic-studio.svg'} alt={r.name} className="h-44 w-full object-cover" />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2"><h3 className="text-xl">{r.name}</h3><p className="text-right text-sm text-navy/60">{naira(r.pricePerNight)}<br />per night</p></div>
                  <p className="text-sm text-navy/60">Sleeps {r.capacity} · {r.available} left for these dates</p>
                  {r.description && <p className="mt-1 text-sm">{r.description}</p>}
                  <dl className="mt-3 space-y-1 text-sm">
                    <div className="flex justify-between"><dt>{q?.nights} night{q?.nights === 1 ? '' : 's'}</dt><dd>{naira(q?.subtotal ?? 0)}</dd></div>
                    {q?.stayDiscount > 0 && <div className="flex justify-between text-emerald-700"><dt>{q.stayDiscountPercent}% long-stay discount</dt><dd>-{naira(q.stayDiscount)}</dd></div>}
                    {r.deal && <div className="flex justify-between text-emerald-700"><dt>Coupon {r.deal.code}</dt><dd>-{naira(r.deal.discount)}</dd></div>}
                    <div className="flex justify-between border-t border-navy/10 pt-2 text-lg"><dt>Total</dt><dd>{naira(total)}</dd></div>
                  </dl>
                  <button className="btn-gold mt-4 w-full" disabled={!r.available || guests > r.capacity} onClick={() => setSel(r)}>{r.available ? (guests > r.capacity ? `Sleeps ${r.capacity}` : 'Book this room') : 'Sold out'}</button>
                </div>
              </div>
            );
          })}
          {rooms.length === 0 && <p className="text-sm text-navy/60">No rooms to show for this branch yet.</p>}
        </div>

        {sel && (
          <form onSubmit={submit} className="card mt-8 max-w-2xl space-y-3">
            <h2 className="text-2xl">Your details</h2>
            <p className="text-sm text-navy/60">{sel.name} at {branch?.name} · {checkIn} to {checkOut}. We will text your booking details to your phone.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">Full name<input className="input mt-1" required minLength={2} autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
              <label className="text-sm">Phone number<input className="input mt-1" required type="tel" inputMode="tel" autoComplete="tel" placeholder="0803 123 4567" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
              <label className="text-sm sm:col-span-2">Email (optional)<input className="input mt-1" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
              <label className="text-sm sm:col-span-2">Special requests (optional)<textarea className="input mt-1" rows={2} maxLength={500} value={f.specialRequests} onChange={(e) => setF({ ...f, specialRequests: e.target.value })} /></label>
            </div>
            <div className="flex flex-wrap gap-2"><button className="btn-gold" disabled={busy}>{busy ? 'Booking…' : 'Confirm booking'}</button><button type="button" className="btn-ghost" onClick={() => setSel(null)}>Change room</button></div>
            <p className="text-xs text-navy/50">You can pay online right after booking. The branch will confirm your room.</p>
          </form>
        )}
      </main>
    </div>
  );
}
