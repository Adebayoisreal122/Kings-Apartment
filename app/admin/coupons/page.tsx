'use client';
import { useCallback, useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import { api, naira } from '@/lib/api';

export default function Coupons() {
  const [list, setList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [f, setF] = useState({ code: '', type: 'percent', value: 10, minTotal: 0, maxUses: 0, branch: '', validTo: '' });
  const [msg, setMsg] = useState('');
  const load = useCallback(() => api('/admin/coupons').then(setList), []);
  useEffect(() => { load().catch((e) => setMsg(e.message)); api('/admin/branches').then(setBranches); }, [load]);
  const add = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg('');
    try { await api('/admin/coupons', { method: 'POST', body: JSON.stringify({ ...f, branch: f.branch || null, validTo: f.validTo || undefined }) }); setF({ ...f, code: '' }); load(); }
    catch (x: any) { setMsg(x.message); }
  };
  const act = (fn: () => Promise<any>) => fn().then(load).catch((x) => setMsg(x.message));
  return (
    <Shell role="admin" title="Coupons">
      {msg && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
      <form onSubmit={add} className="card mb-6 grid gap-3 sm:grid-cols-4">
        <input className="input" required minLength={3} placeholder="Code, e.g. DEC20" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} />
        <select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="percent">Percent off</option><option value="fixed">Fixed ₦ off</option></select>
        <label className="text-xs">{f.type === 'percent' ? 'Percent' : 'Amount (₦)'}<input className="input mt-1" type="number" min={1} required value={f.value} onChange={(e) => setF({ ...f, value: +e.target.value })} /></label>
        <label className="text-xs">Minimum stay total (₦)<input className="input mt-1" type="number" min={0} value={f.minTotal} onChange={(e) => setF({ ...f, minTotal: +e.target.value })} /></label>
        <label className="text-xs">Max uses (0 = unlimited)<input className="input mt-1" type="number" min={0} value={f.maxUses} onChange={(e) => setF({ ...f, maxUses: +e.target.value })} /></label>
        <label className="text-xs">Branch<select className="input mt-1" value={f.branch} onChange={(e) => setF({ ...f, branch: e.target.value })}><option value="">All branches</option>{branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}</select></label>
        <label className="text-xs">Expires on<input className="input mt-1" type="date" value={f.validTo} onChange={(e) => setF({ ...f, validTo: e.target.value })} /></label>
        <button className="btn-gold self-end">Create coupon</button>
      </form>
      <div className="card overflow-x-auto p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy/10 text-navy/60"><tr><th className="p-4">Code</th><th>Discount</th><th>Branch</th><th>Used</th><th>Expires</th><th className="pr-4">Actions</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c._id} className="border-b border-navy/5 last:border-0">
                <td className="p-4 font-medium">{c.code}{!c.active && <span className="badge ml-2 bg-navy-100">paused</span>}</td>
                <td>{c.type === 'percent' ? `${c.value}%` : naira(c.value)}{c.minTotal > 0 && <span className="text-navy/50"> over {naira(c.minTotal)}</span>}</td>
                <td>{c.branch?.name || 'All'}</td><td>{c.used}{c.maxUses ? ` / ${c.maxUses}` : ''}</td><td>{c.validTo ? new Date(c.validTo).toLocaleDateString() : 'Never'}</td>
                <td className="space-x-2 pr-4"><button className="btn-ghost !px-3 !py-1" onClick={() => act(() => api(`/admin/coupons/${c._id}`, { method: 'PATCH', body: JSON.stringify({ active: !c.active }) }))}>{c.active ? 'Pause' : 'Resume'}</button><button className="btn-ghost !px-3 !py-1" onClick={() => confirm(`Delete ${c.code}?`) && act(() => api(`/admin/coupons/${c._id}`, { method: 'DELETE' }))}>Delete</button></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td className="p-6 text-navy/60" colSpan={6}>No coupons yet. Create one above.</td></tr>}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
