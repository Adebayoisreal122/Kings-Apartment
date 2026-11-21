'use client';
import { useCallback, useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';

const tone: Record<string, string> = { available: 'border-emerald-300 bg-emerald-50', occupied: 'border-gold bg-gold-soft', cleaning: 'border-sky-300 bg-sky-50', maintenance: 'border-red-300 bg-red-50' };
export default function ManagerRooms() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const load = useCallback(() => api('/manager/rooms').then(setRooms), []);
  useEffect(() => { load().catch((e) => setErr(e.message)); }, [load]);
  const set = async (id: string, status: string) => { setErr(''); try { await api(`/manager/rooms/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); load(); } catch (e: any) { setErr(e.message); } };
  const groups = Object.entries(rooms.reduce((a: Record<string, any[]>, r) => { (a[r.roomType?.name || 'Other'] ||= []).push(r); return a; }, {}));
  return (
    <Shell role="branch_manager" title="Rooms" subtitle="Update a room when it is cleaned or taken out of service">
      {err && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      {groups.map(([name, list]) => (
        <section key={name} className="mb-8"><h2 className="mb-3 text-xl">{name}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{list.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })).map((r) => (
            <div key={r._id} className={`rounded-2xl border p-4 ${tone[r.status]}`}><p className="font-display text-2xl font-light">{r.number}</p>
              <select aria-label={`Status of room ${r.number}`} className="input mt-2 !py-1.5 capitalize" value={r.status} onChange={(e) => set(r._id, e.target.value)}>{['available', 'occupied', 'cleaning', 'maintenance'].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>))}
          </div></section>
      ))}
      {rooms.length === 0 && <p className="text-sm text-navy/60">No rooms have been added to your branch yet. Ask head office to add them.</p>}
    </Shell>
  );
}
