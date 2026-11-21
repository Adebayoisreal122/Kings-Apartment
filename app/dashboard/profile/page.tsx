'use client';
import { useState } from 'react';
import Shell from '@/components/Shell';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [p, setP] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pw, setPw] = useState({ current: '', next: '' });
  const [m1, setM1] = useState(''); const [m2, setM2] = useState('');
  const saveProfile = async (e: React.FormEvent) => { e.preventDefault(); try { const d = await api('/auth/me', { method: 'PATCH', body: JSON.stringify(p) }); setUser(d.user); setM1('Profile saved.'); } catch (x: any) { setM1(x.message); } };
  const savePw = async (e: React.FormEvent) => { e.preventDefault(); try { await api('/auth/password', { method: 'POST', body: JSON.stringify(pw) }); setPw({ current: '', next: '' }); setM2('Password changed.'); } catch (x: any) { setM2(x.message); } };
  return (
    <Shell role="customer" title="Profile" subtitle="Your details and password">
      <div className="grid max-w-4xl gap-6 md:grid-cols-2">
        <form onSubmit={saveProfile} className="card space-y-3">
          <h2 className="text-xl">Your details</h2>
          <label className="block text-sm">Full name<input className="input mt-1" required minLength={2} value={p.name} onChange={(e) => setP({ ...p, name: e.target.value })} /></label>
          <label className="block text-sm">Email<input className="input mt-1 bg-navy-50" disabled value={user?.email || ''} /></label>
          <label className="block text-sm">Phone<input className="input mt-1" type="tel" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></label>
          {m1 && <p role="status" className="text-sm">{m1}</p>}
          <button className="btn-gold">Save details</button>
        </form>
        <form onSubmit={savePw} className="card space-y-3">
          <h2 className="text-xl">Change password</h2>
          <input className="input" type="password" required placeholder="Current password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
          <input className="input" type="password" required minLength={8} placeholder="New password (8+ characters)" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
          {m2 && <p role="status" className="text-sm">{m2}</p>}
          <button className="btn-navy">Update password</button>
        </form>
      </div>
    </Shell>
  );
}
