'use client';
import { useCallback, useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import Shell from '@/components/Shell';
import { api } from '@/lib/api';

const blank = { name: '', email: '', phone: '', password: '', branch: '' };
export default function Managers() {
  const [list, setList] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [f, setF] = useState<any | null>(null);   // new manager
  const [ed, setEd] = useState<any | null>(null); // manager being edited
  const [msg, setMsg] = useState('');
  const load = useCallback(() => api('/admin/users?role=branch_manager').then(setList), []);
  useEffect(() => { load().catch((e) => setMsg(e.message)); api('/admin/branches').then(setBranches); if (location.search.includes('new=1')) setF({ ...blank }); }, [load]);
  const run = async (fn: () => Promise<any>, ok: string) => { setMsg(''); try { await fn(); setMsg(ok); load(); return true; } catch (e: any) { setMsg(e.message); return false; } };
  const add = async (e: React.FormEvent) => { e.preventDefault(); if (await run(() => api('/admin/users', { method: 'POST', body: JSON.stringify({ ...f, role: 'branch_manager' }) }), 'Manager added. Share the email and temporary password with them.')) setF(null); };
  const save = async (e: React.FormEvent) => { e.preventDefault(); const { _id, name, phone, branch, password } = ed; if (await run(() => api(`/admin/users/${_id}`, { method: 'PATCH', body: JSON.stringify({ name, phone, branch: branch?._id || branch, ...(password ? { password } : {}) }) }), 'Manager updated.')) setEd(null); };
  return (
    <Shell role="admin" title="Branch managers" subtitle="Each manager runs one branch and gets its booking alerts" actions={<button className="btn-gold" onClick={() => setF({ ...blank })}><UserPlus size={16} className="mr-1" />Add manager</button>}>
      {msg && <p role="status" className="mb-4 rounded-xl bg-gold-soft p-3 text-sm">{msg}</p>}
      {f && (
        <form onSubmit={add} className="card mb-6 grid gap-3 sm:grid-cols-2">
          <h2 className="text-xl sm:col-span-2">New branch manager</h2>
          <input className="input" required placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input className="input" required type="email" placeholder="Email (they sign in with this)" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <input className="input" type="tel" placeholder="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
          <input className="input" required minLength={8} type="text" placeholder="Temporary password (8+ characters)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
          <select className="input sm:col-span-2" required value={f.branch} onChange={(e) => setF({ ...f, branch: e.target.value })}><option value="">Branch this manager runs</option>{branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}</select>
          <div className="flex gap-2 sm:col-span-2"><button className="btn-gold">Add manager</button><button type="button" className="btn-ghost" onClick={() => setF(null)}>Cancel</button></div>
        </form>
      )}
      {ed && (
        <form onSubmit={save} className="card mb-6 grid gap-3 sm:grid-cols-2">
          <h2 className="text-xl sm:col-span-2">Edit {ed.email}</h2>
          <input className="input" required value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} />
          <input className="input" type="tel" placeholder="Phone" value={ed.phone || ''} onChange={(e) => setEd({ ...ed, phone: e.target.value })} />
          <select className="input" value={ed.branch?._id || ed.branch || ''} onChange={(e) => setEd({ ...ed, branch: e.target.value })}>{branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}</select>
          <input className="input" type="text" minLength={8} placeholder="New password (leave empty to keep)" value={ed.password || ''} onChange={(e) => setEd({ ...ed, password: e.target.value })} />
          <div className="flex gap-2 sm:col-span-2"><button className="btn-gold">Save changes</button><button type="button" className="btn-ghost" onClick={() => setEd(null)}>Cancel</button></div>
        </form>
      )}
      <div className="card overflow-x-auto !p-0">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-navy/10 text-navy/60"><tr><th className="p-4">Manager</th><th>Branch</th><th>Phone</th><th>Status</th><th className="pr-4">Actions</th></tr></thead>
          <tbody>
            {list.map((m) => (
              <tr key={m._id} className="border-b border-navy/5 last:border-0">
                <td className="p-4"><p className="font-medium">{m.name}</p><p className="text-xs text-navy/50">{m.email}</p></td>
                <td>{m.branch?.name || <span className="text-red-700">No branch</span>}</td><td>{m.phone || '-'}</td>
                <td><span className={`badge ${m.active ? 'bg-emerald-100 text-emerald-800' : 'bg-navy-100 text-navy/60'}`}>{m.active ? 'Active' : 'Deactivated'}</span></td>
                <td className="space-x-2 pr-4"><button className="btn-ghost !px-3 !py-1" onClick={() => setEd({ ...m, _id: m._id })}>Edit</button>
                  <button className="btn-ghost !px-3 !py-1" onClick={() => run(() => api(`/admin/users/${m._id}`, { method: 'PATCH', body: JSON.stringify({ active: !m.active }) }), m.active ? 'Manager deactivated. They can no longer sign in.' : 'Manager reactivated.')}>{m.active ? 'Deactivate' : 'Activate'}</button></td>
              </tr>
            ))}
            {list.length === 0 && <tr><td colSpan={5} className="p-6 text-navy/60">No managers yet. Add one for each branch so bookings are handled and alerts reach them.</td></tr>}
          </tbody>
        </table>
      </div>
    </Shell>
  );
}
