'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api, downloadCsv } from '@/lib/api';

const iso = (d: Date) => d.toISOString().slice(0, 10);
export default function Reports() {
  const now = new Date();
  const [from, setFrom] = useState(iso(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(iso(now));
  const [branch, setBranch] = useState('');
  const [branches, setBranches] = useState<any[]>([]);
  const [msg, setMsg] = useState('');
  useEffect(() => { api('/admin/branches').then(setBranches); }, []);
  const go = () => { setMsg(''); const q = new URLSearchParams({ from, to, ...(branch ? { branch } : {}) }); downloadCsv(`/admin/reports/bookings.csv?${q}`, `bookings-${from}-to-${to}.csv`).catch((e) => setMsg(e.message)); };
  return (
    <Shell role="admin" title="Reports">
      <div className="card max-w-2xl space-y-4">
        <h2 className="text-xl">Bookings export</h2>
        <p className="text-sm text-navy/60">Downloads a CSV you can open in Excel or Google Sheets. Bookings are included by check-in date.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm">From<input className="input mt-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
          <label className="text-sm">To<input className="input mt-1" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          <label className="text-sm">Branch<select className="input mt-1" value={branch} onChange={(e) => setBranch(e.target.value)}><option value="">All branches</option>{branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}</select></label>
        </div>
        {msg && <p role="alert" className="text-sm text-red-700">{msg}</p>}
        <button className="btn-gold" onClick={go}>Download CSV</button>
      </div>
    </Shell>
  );
}
