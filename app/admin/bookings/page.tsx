'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import StatusBadge from '@/components/StatusBadge';
import { api, naira } from '@/lib/api';

export default function AdminBookings() {
  const [list, setList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [branch, setBranch] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => { api('/admin/branches').then(setBranches); }, []);
  useEffect(() => { const p = new URLSearchParams({ ...(branch ? { branch } : {}), ...(status ? { status } : {}) }); api(`/admin/bookings?${p}`).then(setList); }, [branch, status]);
  const shown = list.filter((b) => !q || `${b.reference} ${b.guest?.name} ${b.guest?.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Shell role="admin" title="All bookings" subtitle="Latest 200 across every branch">
      <div className="card mb-4 grid gap-3 sm:grid-cols-3">
        <input className="input" placeholder="Search reference, guest or phone" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={branch} onChange={(e) => setBranch(e.target.value)}><option value="">All branches</option>{branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}</select>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>
      </div>
      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy/10 text-navy/60"><tr><th className="p-4">Reference</th><th>Guest</th><th>Branch</th><th>Room</th><th>Dates</th><th>Total</th><th>Payment</th><th className="pr-4">Status</th></tr></thead>
          <tbody>{shown.map((b) => <tr key={b._id} className="border-b border-navy/5 last:border-0"><td className="p-4">{b.reference}</td><td>{b.guest?.name}<br /><span className="text-xs text-navy/50">{b.guest?.email}</span></td><td>{b.branch?.name}</td><td>{b.roomType?.name}</td><td className="whitespace-nowrap">{new Date(b.checkIn).toLocaleDateString()} to {new Date(b.checkOut).toLocaleDateString()}</td><td>{naira(b.total)}</td><td><StatusBadge s={b.paymentStatus} /></td><td className="pr-4"><StatusBadge s={b.status} /></td></tr>)}
            {shown.length === 0 && <tr><td colSpan={8} className="p-6 text-navy/60">No bookings match.</td></tr>}</tbody>
        </table>
      </div>
    </Shell>
  );
}
