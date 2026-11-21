'use client';
import { useState } from 'react';
import Shell from '@/components/Shell';
import { downloadCsv } from '@/lib/api';

const iso = (d: Date) => d.toISOString().slice(0, 10);
export default function ManagerReports() {
  const now = new Date();
  const [from, setFrom] = useState(iso(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(iso(now));
  const [msg, setMsg] = useState('');
  return (
    <Shell role="branch_manager" title="Reports" subtitle="Download your branch's bookings">
      <div className="card max-w-xl space-y-4">
        <p className="text-sm text-navy/60">Downloads a CSV you can open in Excel or Google Sheets. Bookings are included by check-in date.</p>
        <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm">From<input className="input mt-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label><label className="text-sm">To<input className="input mt-1" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label></div>
        {msg && <p role="alert" className="text-sm text-red-700">{msg}</p>}
        <button className="btn-gold" onClick={() => { setMsg(''); downloadCsv(`/manager/report.csv?from=${from}&to=${to}`, `bookings-${from}-to-${to}.csv`).catch((e) => setMsg(e.message)); }}>Download CSV</button>
      </div>
    </Shell>
  );
}
