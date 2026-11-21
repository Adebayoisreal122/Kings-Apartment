'use client';
import { useCallback, useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import ImageUpload from '@/components/ImageUpload';
import { api, naira } from '@/lib/api';

const blank = { name: '', pricePerNight: 0, capacity: 2, description: '', images: [] as string[] };
// "101-105, 201" -> ['101','102','103','104','105','201']
const parseNumbers = (t: string) => t.split(',').map((s) => s.trim()).filter(Boolean).flatMap((p) => {
  const m = p.match(/^(\d+)-(\d+)$/);
  if (!m) return [p];
  const [a, b] = [+m[1], +m[2]];
  return b >= a && b - a < 100 ? Array.from({ length: b - a + 1 }, (_, i) => String(a + i)) : [];
});

export default function RoomsAndRates() {
  const [branches, setBranches] = useState<any[]>([]);
  const [bid, setBid] = useState('');
  const [types, setTypes] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [td, setTd] = useState<any | null>(null); // room type being created or edited
  const [rf, setRf] = useState({ roomType: '', numbers: '' });
  const [rr, setRr] = useState({ name: '', roomType: '', startDate: '', endDate: '', mode: 'percent', value: 10, weekendsOnly: false });
  const [msg, setMsg] = useState('');

  useEffect(() => { api('/admin/branches').then((b) => { setBranches(b); setBid(b[0]?._id || ''); }); }, []);
  const load = useCallback(async () => {
    if (!bid) return;
    const [t, r, u] = await Promise.all([api(`/admin/room-types?branch=${bid}`), api(`/admin/rooms?branch=${bid}`), api(`/admin/rate-rules?branch=${bid}`)]);
    setTypes(t); setRooms(r); setRules(u);
  }, [bid]);
  useEffect(() => { load().catch((e) => setMsg(e.message)); }, [load]);
  const run = async (fn: () => Promise<any>) => { setMsg(''); try { await fn(); await load(); } catch (e: any) { setMsg(e.message); } };

  const saveType = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const body = JSON.stringify({ ...td, pricePerNight: +td.pricePerNight, capacity: +td.capacity, branch: bid });
    await api(td._id ? `/admin/room-types/${td._id}` : '/admin/room-types', { method: td._id ? 'PUT' : 'POST', body });
    setTd(null);
  }); };
  const addRooms = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    const numbers = parseNumbers(rf.numbers);
    const out = await api('/admin/rooms', { method: 'POST', body: JSON.stringify({ branch: bid, roomType: rf.roomType, numbers }) });
    setMsg(`${out.added} room${out.added === 1 ? '' : 's'} added${out.skipped ? `, ${out.skipped} skipped (number already used)` : ''}.`);
    setRf({ ...rf, numbers: '' });
  }); };
  const addRule = (e: React.FormEvent) => { e.preventDefault(); run(async () => {
    await api('/admin/rate-rules', { method: 'POST', body: JSON.stringify({ ...rr, value: +rr.value, branch: bid, roomType: rr.roomType || null }) });
    setRr({ ...rr, name: '' });
  }); };
  const effect = (r: any) => (r.mode === 'set' ? `${naira(r.value)} per night` : `${r.value > 0 ? '+' : ''}${r.value}%`) + (r.weekendsOnly ? ' on Fri and Sat nights' : '');
  const day = (d: string) => new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

  return (
    <Shell role="admin" title="Rooms & rates">
      <label className="mb-6 block max-w-xs text-sm">Branch
        <select className="input mt-1" value={bid} onChange={(e) => setBid(e.target.value)}>{branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}</select>
      </label>
      {msg && <p role="status" className="mb-4 rounded-xl bg-gold-soft p-3 text-sm">{msg}</p>}

      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-2xl">Room types</h2><button className="btn-gold" onClick={() => setTd({ ...blank })}>Add room type</button></div>
        <div className="grid gap-4 md:grid-cols-2">
          {types.map((t) => (
            <div key={t._id} className="card flex gap-4">
              {t.images?.[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={t.images[0]} alt="" className="h-24 w-32 rounded-lg object-cover" /> : <div className="h-24 w-32 rounded-lg bg-navy-50" />}
              <div className="flex-1"><h3 className="text-lg">{t.name}</h3><p className="text-sm text-navy/60">{naira(t.pricePerNight)} / night · sleeps {t.capacity} · {t.totalRooms} room{t.totalRooms === 1 ? '' : 's'}</p>
                <div className="mt-3 flex gap-2"><button className="btn-ghost !px-3 !py-1" onClick={() => setTd({ ...t })}>Edit</button><button className="btn-ghost !px-3 !py-1" onClick={() => confirm(`Delete ${t.name} and its rooms?`) && run(() => api(`/admin/room-types/${t._id}`, { method: 'DELETE' }))}>Delete</button></div></div>
            </div>
          ))}
          {types.length === 0 && <p className="text-sm text-navy/60">No room types yet. Add one, then add its rooms below.</p>}
        </div>
        {td && (
          <form onSubmit={saveType} className="card mt-4 space-y-3">
            <h3 className="text-lg">{td._id ? `Edit ${td.name}` : 'New room type'}</h3>
            <div className="grid gap-3 sm:grid-cols-3">
              <input className="input" placeholder="Name, e.g. Deluxe Suite" required value={td.name} onChange={(e) => setTd({ ...td, name: e.target.value })} />
              <input className="input" type="number" min={0} placeholder="Price per night (₦)" required value={td.pricePerNight} onChange={(e) => setTd({ ...td, pricePerNight: e.target.value })} />
              <input className="input" type="number" min={1} placeholder="Sleeps" required value={td.capacity} onChange={(e) => setTd({ ...td, capacity: e.target.value })} />
              <textarea className="input sm:col-span-3" rows={2} placeholder="Description" value={td.description || ''} onChange={(e) => setTd({ ...td, description: e.target.value })} />
            </div>
            <ImageUpload value={td.images || []} onChange={(images) => setTd({ ...td, images })} />
            <div className="flex gap-2"><button className="btn-gold">Save room type</button><button type="button" className="btn-ghost" onClick={() => setTd(null)}>Cancel</button></div>
          </form>
        )}
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-2xl">Rooms</h2>
        <div className="card">
          <div className="mb-4 flex flex-wrap gap-2">
            {rooms.map((r) => <span key={r._id} className="flex items-center gap-2 rounded-full border border-navy/15 px-3 py-1 text-sm">{r.number} <span className="text-navy/50">{r.roomType?.name} · {r.status}</span>
              <button aria-label={`Remove room ${r.number}`} className="text-navy/50 hover:text-red-700" onClick={() => run(() => api(`/admin/rooms/${r._id}`, { method: 'DELETE' }))}>×</button></span>)}
            {rooms.length === 0 && <p className="text-sm text-navy/60">No rooms yet.</p>}
          </div>
          <form onSubmit={addRooms} className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
            <select className="input" required value={rf.roomType} onChange={(e) => setRf({ ...rf, roomType: e.target.value })}><option value="">Room type</option>{types.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}</select>
            <input className="input" required placeholder="Room numbers, e.g. 101-110, 205" value={rf.numbers} onChange={(e) => setRf({ ...rf, numbers: e.target.value })} />
            <button className="btn-gold">Add rooms</button>
          </form>
          <p className="mt-2 text-xs text-navy/50">The number of rooms of each type sets how many guests can book it for the same dates.</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-2xl">Rate rules</h2>
        <div className="card">
          <ul className="mb-4 divide-y divide-navy/5 text-sm">
            {rules.map((r) => (
              <li key={r._id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span><b>{r.name}</b> · {r.roomType?.name || 'All room types'}<br /><span className="text-navy/60">{day(r.startDate)} to {day(r.endDate)} · {effect(r)}</span></span>
                <span className="flex gap-2"><button className="btn-ghost !px-3 !py-1" onClick={() => run(() => api(`/admin/rate-rules/${r._id}`, { method: 'PATCH', body: JSON.stringify({ active: !r.active }) }))}>{r.active ? 'Pause' : 'Resume'}</button><button className="btn-ghost !px-3 !py-1" onClick={() => run(() => api(`/admin/rate-rules/${r._id}`, { method: 'DELETE' }))}>Delete</button></span>
              </li>
            ))}
            {rules.length === 0 && <li className="py-3 text-navy/60">No rate rules. Guests pay each room type&rsquo;s base price.</li>}
          </ul>
          <form onSubmit={addRule} className="grid gap-2 sm:grid-cols-4">
            <input className="input sm:col-span-2" required placeholder="Rule name, e.g. December peak" value={rr.name} onChange={(e) => setRr({ ...rr, name: e.target.value })} />
            <select className="input sm:col-span-2" value={rr.roomType} onChange={(e) => setRr({ ...rr, roomType: e.target.value })}><option value="">All room types</option>{types.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}</select>
            <label className="text-xs">From<input className="input mt-1" type="date" required value={rr.startDate} onChange={(e) => setRr({ ...rr, startDate: e.target.value })} /></label>
            <label className="text-xs">To<input className="input mt-1" type="date" required value={rr.endDate} onChange={(e) => setRr({ ...rr, endDate: e.target.value })} /></label>
            <label className="text-xs">Change<select className="input mt-1" value={rr.mode} onChange={(e) => setRr({ ...rr, mode: e.target.value })}><option value="percent">Percent (+ or −)</option><option value="set">Set nightly price (₦)</option></select></label>
            <label className="text-xs">{rr.mode === 'percent' ? 'Percent' : 'Price (₦)'}<input className="input mt-1" type="number" required value={rr.value} onChange={(e) => setRr({ ...rr, value: +e.target.value })} /></label>
            <label className="flex items-center gap-2 text-sm sm:col-span-3"><input type="checkbox" checked={rr.weekendsOnly} onChange={(e) => setRr({ ...rr, weekendsOnly: e.target.checked })} /> Fri and Sat nights only</label>
            <button className="btn-gold">Add rule</button>
          </form>
        </div>
      </section>
    </Shell>
  );
}
