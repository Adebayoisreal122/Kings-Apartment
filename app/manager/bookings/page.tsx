'use client';
import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Shell from '@/components/Shell';
import StatusBadge from '@/components/StatusBadge';
import { API, api, downloadCsv, getToken, naira } from '@/lib/api';

export default function ManagerBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState('');
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    const [b, r] = await Promise.all([api(`/manager/bookings${filter ? `?status=${filter}` : ''}`), api('/manager/rooms')]);
    setBookings(b); setRooms(r);
  }, [filter]);
  useEffect(() => { const r = new URLSearchParams(location.search).get('ref'); if (r) setQ(r); }, []);
  useEffect(() => { load().catch((e) => setErr(e.message)); }, [load]);
  useEffect(() => { const s = io(API, { auth: { token: getToken() } }); s.on('notification', () => load()); return () => { s.disconnect(); }; }, [load]);
  const move = async (id: string, status: string, roomId?: string) => { setErr(''); try { await api(`/manager/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, roomId }) }); load(); } catch (e: any) { setErr(e.message); } };
  const free = (b: any) => rooms.filter((r) => r.status === 'available' && String(r.roomType?._id) === String(b.roomType?._id));
  const shown = bookings.filter((b) => !q || `${b.reference} ${b.guest?.name}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Shell role="branch_manager" title="Bookings" subtitle="Confirm, check in and check out guests" actions={<button className="btn-ghost" onClick={() => downloadCsv('/manager/report.csv', 'branch-bookings.csv').catch((e) => setErr(e.message))}>Export CSV</button>}>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {['', 'pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((s) => <button key={s} onClick={() => setFilter(s)} className={filter === s ? 'btn-navy' : 'btn-ghost'}>{s ? s.replace('_', ' ') : 'All'}</button>)}
        <input className="input ml-auto max-w-56" placeholder="Search guest or reference" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {err && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy/10 text-navy/60"><tr><th className="p-4">Guest</th><th>Room</th><th>Dates</th><th>Total</th><th>Status</th><th className="pr-4">Action</th></tr></thead>
          <tbody>
            {shown.map((b) => (
              <tr key={b._id} className="border-b border-navy/5 last:border-0">
                <td className="p-4"><p className="font-medium">{b.guest?.name}</p><p className="text-xs text-navy/50">{b.reference} · <a className="underline" href={`tel:+${b.guest?.phone}`}>+{b.guest?.phone}</a></p></td>
                <td>{b.roomType?.name}{b.room && ` · ${b.room.number}`}</td>
                <td className="whitespace-nowrap">{new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()}</td>
                <td>{naira(b.total)} <StatusBadge s={b.paymentStatus} /></td><td><StatusBadge s={b.status} /></td>
                <td className="pr-4"><div className="flex flex-wrap items-center gap-2">
                  {b.status === 'pending' && <><button className="btn-gold !px-4 !py-1.5" onClick={() => move(b._id, 'confirmed')}>Confirm</button><button className="btn-ghost !px-4 !py-1.5" onClick={() => move(b._id, 'cancelled')}>Decline</button></>}
                  {b.status === 'confirmed' && (free(b).length ? <><select aria-label="Room" className="input !w-auto !py-1.5" value={pick[b._id] || free(b)[0]._id} onChange={(e) => setPick({ ...pick, [b._id]: e.target.value })}>{free(b).map((r) => <option key={r._id} value={r._id}>Room {r.number}</option>)}</select><button className="btn-navy !px-4 !py-1.5" onClick={() => move(b._id, 'checked_in', pick[b._id] || free(b)[0]._id)}>Check in</button></> : <span className="text-xs text-red-700">No free {b.roomType?.name} room</span>)}
                  {b.status === 'checked_in' && <button className="btn-navy !px-4 !py-1.5" onClick={() => move(b._id, 'checked_out')}>Check out</button>}
                </div></td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td className="p-6 text-navy/60" colSpan={6}>No bookings here yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
