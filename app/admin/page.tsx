'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Banknote, Building2, CalendarCheck, Clock, Plus, UserPlus, Users, BedDouble } from 'lucide-react';
import Shell from '@/components/Shell';
import StatCard from '@/components/StatCard';
import StatusBadge from '@/components/StatusBadge';
import { api, naira } from '@/lib/api';

export default function AdminOverview() {
  const [stats, setStats] = useState<any>({ byBranch: [], totals: [], guests: 0 });
  const [branches, setBranches] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const [err, setErr] = useState('');
  useEffect(() => {
    Promise.all([api('/admin/stats'), api('/admin/branches'), api('/admin/bookings')]).then(([s, b, r]) => { setStats(s); setBranches(b); setRecent(r.slice(0, 8)); }).catch((e) => setErr(e.message));
  }, []);
  const count = (s: string) => stats.totals.find((t: any) => t._id === s)?.n ?? 0;
  const all = stats.totals.reduce((a: number, t: any) => a + t.n, 0);
  const revenue = stats.byBranch.reduce((a: number, b: any) => a + b.revenue, 0);
  const max = Math.max(1, ...stats.byBranch.map((b: any) => b.revenue));
  return (
    <Shell role="admin" title="Head office" subtitle="Everything across all branches" actions={<><Link href="/admin/branches?new=1" className="btn-gold"><Plus size={16} className="mr-1" />Add branch</Link><Link href="/admin/managers?new=1" className="btn-navy"><UserPlus size={16} className="mr-1" />Add manager</Link></>}>
      {err && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Banknote} label="Paid revenue" value={naira(revenue)} />
        <StatCard icon={CalendarCheck} tone="navy" label="Total bookings" value={all} />
        <StatCard icon={Clock} label="Waiting for confirmation" value={count('pending')} />
        <StatCard icon={BedDouble} tone="green" label="Guests in house" value={count('checked_in')} />
        <StatCard icon={Building2} tone="navy" label="Branches" value={branches.length} />
        <StatCard icon={Users} label="Guests who booked" value={stats.guests} />
      </div>
      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-2">
          <h2 className="mb-4 text-xl">Revenue by branch</h2>
          <ul className="space-y-4">{stats.byBranch.map((b: any) => (
            <li key={b._id}><div className="mb-1 flex justify-between text-sm"><span>{b.name}</span><span className="text-navy/60">{b.bookings} bookings · {naira(b.revenue)}</span></div>
              <div className="h-3 overflow-hidden rounded-full bg-navy-50"><div className="h-full rounded-full bg-gold" style={{ width: `${(b.revenue / max) * 100}%` }} /></div></li>))}
            {stats.byBranch.length === 0 && <li className="text-sm text-navy/60">No bookings yet.</li>}
          </ul>
        </section>
        <section className="card">
          <h2 className="mb-4 text-xl">Booking status</h2>
          <ul className="space-y-3 text-sm">{['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((s) => <li key={s} className="flex items-center justify-between"><StatusBadge s={s} /><span className="font-display text-xl font-light">{count(s)}</span></li>)}</ul>
        </section>
      </div>
      <section className="card overflow-x-auto !p-0">
        <div className="flex items-center justify-between p-5 pb-2"><h2 className="text-xl">Latest bookings</h2><Link href="/admin/bookings" className="text-sm underline">View all</Link></div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy/10 text-navy/60"><tr><th className="p-4">Reference</th><th>Guest</th><th>Branch</th><th>Total</th><th className="pr-4">Status</th></tr></thead>
          <tbody>{recent.map((b) => <tr key={b._id} className="border-b border-navy/5 last:border-0"><td className="p-4">{b.reference}</td><td>{b.guest?.name}</td><td>{b.branch?.name}</td><td>{naira(b.total)}</td><td className="pr-4"><StatusBadge s={b.status} /></td></tr>)}
            {recent.length === 0 && <tr><td colSpan={5} className="p-6 text-navy/60">No bookings yet.</td></tr>}</tbody>
        </table>
      </section>
    </Shell>
  );
}
