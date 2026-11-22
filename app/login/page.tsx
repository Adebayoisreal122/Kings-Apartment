'use client';
import Link from 'next/link';
import { useState } from 'react';
import Logo from '@/components/Logo';
import { useAuth } from '@/lib/auth';

export default function Login() {
  const { login } = useAuth();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    try { await login(f.email, f.password); } catch (x: any) { setErr(x.message); setBusy(false); }
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-50 p-5">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4">
        <Logo />
        <h1 className="pt-2 text-2xl">Staff sign in</h1><p className="text-sm text-navy/60">For head office and branch managers. Guests do not need an account.</p>
        <input className="input" type="email" placeholder="Email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className="input" type="password" placeholder="Password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <button className="btn-navy w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <p className="text-center text-sm text-navy/60"><Link className="underline" href="/book">Book a stay instead</Link></p>
      </form>
    </main>
  );
}
