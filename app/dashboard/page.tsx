'use client';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Shell from '@/components/Shell';
import Stars from '@/components/Stars';
import { useAuth } from '@/lib/auth';
import { api, naira } from '@/lib/api';

const today = () => new Date().toISOString().slice(0, 10);
const plus = (d: string, n: number) => new Date(+new Date(d) + n * 864e5).toISOString().slice(0, 10);

export default function BookAStay() {
  const router = useRouter();
  const { user } = useAuth();
  const [branches, setBranches] = useState<any[]>([]);
  const [branchId, setBranchId] = useState('');
  const [branch, setBranch] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [checkIn, setCheckIn] = useState(today());
  const [checkOut, setCheckOut] = useState(plus(today(), 1));
  const [guests, setGuests] = useState(1);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState('');
  const [rooms, setRooms] = useState<any[]>([]);
  const [msg, setMsg] = useState('');

  useEffect(() => { // pick up the search from the homepage
    const q = new URLSearchParams(location.search);
    if (q.get('in') && q.get('in')! >= today()) setCheckIn(q.get('in')!);
    if (q.get('out') && q.get('out')! > (q.get('in') || today())) setCheckOut(q.get('out')!);
    if (q.get('guests')) setGuests(Math.max(1, +q.get('guests')! || 1));
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
    setBranch(b); setRooms(list); setApplied(couponCode);
  }, [branchId, checkIn, checkOut]);
  useEffect(() => { search(code.trim()).catch((e) => setMsg(e.message)); /* eslint-disable-next-line */ }, [branchId, checkIn, checkOut]);
  useEffect(() => { if (branchId) api(`/reviews?branch=${branchId}`).then(setReviews).catch(() => {}); }, [branchId]);

  const book = async (r: any) => {
    try { await api('/bookings', { method: 'POST', body: JSON.stringify({ roomType: r._id, checkIn, checkOut, guests, couponCode: r.deal ? applied : undefined }) }); router.push('/dashboard/bookings'); }
    catch (e: any) { setMsg(e.message); }
  };

  return (
    <Shell role="customer" title={`Welcome, ${user?.name.split(' ')[0] ?? ''}`} subtitle="Choose a branch and your dates to see what is available">
      {msg && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
      <div className="card mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm lg:col-span-2">Branch<select className="input mt-1" value={branchId} onChange={(e) => setBranchId(e.target.value)}>{branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}</select></label>
        <label className="text-sm">Check in<input className="input mt-1" type="date" min={today()} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); if (e.target.value >= checkOut) setCheckOut(plus(e.target.value, 1)); }} /></label>
        <label className="text-sm">Check out<input className="input mt-1" type="date" min={plus(checkIn, 1)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></label>
        <label className="text-sm">Guests<input className="input mt-1" type="number" min={1} max={6} value={guests} onChange={(e) => setGuests(+e.target.value || 1)} /></label>
        <form className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-5" onSubmit={(e) => { e.preventDefault(); search(code.trim()).catch((x) => setMsg(x.message)); }}>
          <input className="input max-w-xs" placeholder="Coupon code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
          <button className="btn-ghost">Apply coupon</button>
          {applied && !msg && <span className="text-sm text-emerald-700">{applied} applied</span>}
        </form>
      </div>

      {branch && (
        <div className="card mb-6 flex flex-wrap items-center gap-4">
          {branch.images?.[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={branch.images[0]} alt="" className="h-24 w-36 rounded-xl object-cover" /> : <div className="flex h-24 w-36 items-center justify-center rounded-xl bg-navy text-xs tracking-[0.3em] text-gold">{branch.city?.toUpperCase()}</div>}
          <div><h2 className="text-2xl">{branch.name}</h2><p className="text-sm text-navy/60">{branch.address}</p>
            {branch.rating ? <p className="text-sm"><Stars value={branch.rating} /> {branch.rating} · {branch.reviews} review{branch.reviews === 1 ? '' : 's'}</p> : <p className="text-sm text-navy/50">No reviews yet</p>}</div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {rooms.map((r) => {
          const base = r.quote?.subtotal ?? r.pricePerNight; const total = r.deal ? r.deal.total : base;
          return (
            <div key={r._id} className="card overflow-hidden !p-0">
              {r.images?.[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.images[0]} alt={r.name} className="h-44 w-full object-cover" /> : /* eslint-disable-next-line @next/next/no-img-element */ <img src="/rooms/classic-studio.svg" alt="" className="h-44 w-full object-cover" />}
              <div className="p-5">
                <h3 className="text-xl">{r.name}</h3>
                <p className="text-sm text-navy/60">Sleeps {r.capacity} · {r.available} left for these dates</p>
                {r.description && <p className="mt-1 text-sm">{r.description}</p>}
                <p className="mt-3 text-lg">{naira(total)} <span className="text-sm text-navy/60">for {r.quote?.nights} night{r.quote?.nights === 1 ? '' : 's'}</span></p>
                {r.deal && <p className="text-sm text-emerald-700">{naira(r.deal.discount)} off with {r.deal.code} <span className="text-navy/50 line-through">{naira(base)}</span></p>}
                <button className="btn-gold mt-4" disabled={!r.available || guests > r.capacity} onClick={() => book(r)}>{r.available ? (guests > r.capacity ? `Sleeps ${r.capacity}` : 'Book this room') : 'Sold out'}</button>
              </div>
            </div>
          );
        })}
        {rooms.length === 0 && <p className="text-sm text-navy/60">No rooms to show for this branch yet.</p>}
      </div>

      {reviews.length > 0 && (
        <section className="mt-10"><h2 className="mb-3 text-2xl">What guests say</h2>
          <div className="grid gap-3 md:grid-cols-2">{reviews.slice(0, 4).map((v) => <div key={v._id} className="card"><Stars value={v.rating} /> <span className="text-sm text-navy/60">{v.name}</span>{v.comment && <p className="mt-1 text-sm">{v.comment}</p>}</div>)}</div>
        </section>
      )}
    </Shell>
  );
}
