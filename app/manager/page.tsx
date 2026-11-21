'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Banknote, BedDouble, Clock, LogIn, LogOut } from 'lucide-react';
import Shell from '@/components/Shell';
import StatCard from '@/components/StatCard';
import { API, api, getToken, naira } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function ManagerOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({ rooms: [] });
  const [pending, setPending] = useState<any[]>([]);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    const [s, p] = await Promise.all([api('/manager/stats'), api('/manager/bookings?status=pending')]);
    setStats(s); setPending(p);
  }, []);
  useEffect(() => { load().catch((e) => setErr(e.message)); }, [load]);
  useEffect(() => { const s = io(API, { auth: { token: getToken() } }); s.on('notification', () => load()); return () => { s.disconnect(); }; }, [load]);
  const decide = async (id: string, status: string) => { setErr(''); try { await api(`/manager/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); load(); } catch (e: any) { setErr(e.message); } };
  const room = (s: string) => stats.rooms.find((r: any) => r._id === s)?.n ?? 0;
  const totalRooms = stats.rooms.reduce((a: number, r: any) => a + r.n, 0);
  return (
    <Shell role="branch_manager" title={user?.branchName || 'Branch overview'} subtitle="Today at your branch">
      {err && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Clock} label="Waiting for you" value={stats.pending ?? 0} hint="New bookings to confirm" />
        <StatCard icon={LogIn} tone="navy" label="Arriving today" value={stats.arrivals ?? 0} />
        <StatCard icon={LogOut} tone="navy" label="Leaving today" value={stats.departures ?? 0} />
        <StatCard icon={Banknote} tone="green" label="Paid revenue" value={naira(stats.revenue ?? 0)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xl">New bookings to confirm</h2><Link href="/manager/bookings" className="text-sm underline">All bookings</Link></div>
          <ul className="divide-y divide-navy/5">
            {pending.slice(0, 6).map((b) => (
              <li key={b._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div><p className="font-medium">{b.customer?.name} <span className="text-xs font-normal text-navy/50">{b.reference}</span></p><p className="text-sm text-navy/60">{b.roomType?.name} · {new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()} · {naira(b.total)}</p></div>
                <div className="flex gap-2"><button className="btn-gold !px-4 !py-1.5" onClick={() => decide(b._id, 'confirmed')}>Confirm</button><button className="btn-ghost !px-4 !py-1.5" onClick={() => decide(b._id, 'cancelled')}>Decline</button></div>
              </li>))}
            {pending.length === 0 && <li className="py-6 text-sm text-navy/60">You are all caught up. New bookings appear here the moment a guest books.</li>}
          </ul>
        </section>
        <section className="card">
          <div className="mb-3 flex items-center justify-between"><h2 className="text-xl">Rooms</h2><Link href="/manager/rooms" className="text-sm underline">Manage</Link></div>
          <p className="mb-4 flex items-center gap-2 text-sm text-navy/60"><BedDouble size={16} />{totalRooms} rooms in total</p>
          <ul className="space-y-3 text-sm">{[['available', 'bg-emerald-500'], ['occupied', 'bg-gold'], ['cleaning', 'bg-sky-500'], ['maintenance', 'bg-red-500']].map(([s, c]) => <li key={s} className="flex items-center justify-between"><span className="flex items-center gap-2 capitalize"><span className={`h-2.5 w-2.5 rounded-full ${c}`} />{s}</span><b>{room(s)}</b></li>)}</ul>
        </section>
      </div>
    </Shell>
  );
}
