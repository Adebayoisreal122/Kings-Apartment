'use client';
import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/auth';

export default function Register() {
  const { register } = useAuth();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await register(f, location.search ? `/dashboard${location.search}` : undefined); } catch (x: any) { setErr(x.message); setBusy(false); }
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-50 p-5">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <Logo />
        <h1 className="pt-2 text-2xl">Create your account</h1>
        <input className="input" placeholder="Full name" required value={f.name} onChange={set('name')} />
        <input className="input" type="email" placeholder="Email" required value={f.email} onChange={set('email')} />
        <input className="input" type="tel" placeholder="Phone number" value={f.phone} onChange={set('phone')} />
        <input className="input" type="password" placeholder="Password (8+ characters)" minLength={8} required value={f.password} onChange={set('password')} />
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button className="btn-gold w-full" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="text-center text-sm text-navy/60">Already registered? <Link className="text-navy underline" href="/login">Sign in</Link></p>
      </form>
    </main>
  );
}
