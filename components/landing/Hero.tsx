'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { useAuth, home } from '@/lib/auth';

const today = () => new Date().toISOString().slice(0, 10);
const plus = (d: string, n: number) => new Date(+new Date(d) + n * 864e5).toISOString().slice(0, 10);
export default function Hero({ branches }: { branches: any[] }) {
  const router = useRouter();
  const { user } = useAuth();
  const [f, setF] = useState({ branch: '', checkIn: today(), checkOut: plus(today(), 1), guests: 1 });
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const q = new URLSearchParams({ ...(f.branch ? { branch: f.branch } : {}), in: f.checkIn, out: f.checkOut, guests: String(f.guests) });
    router.push(user?.role === 'customer' ? `/dashboard?${q}` : user ? home(user.role) : `/register?${q}`);
  };
  return (
    <section className="relative overflow-hidden bg-navy text-white">
      <div aria-hidden className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 85% 20%, #E8B50A55, transparent 40%), radial-gradient(circle at 10% 90%, #012555, transparent 50%)' }} />
      <svg aria-hidden className="absolute -right-16 top-10 hidden h-[420px] w-[420px] text-gold/15 lg:block" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth=".6"><circle cx="50" cy="50" r="48" /><circle cx="50" cy="50" r="36" /><path d="M8 62 50 30l42 32M50 30V8" /></svg>
      <div className="relative mx-auto max-w-6xl px-5 pb-32 pt-16 sm:pt-24">
        <p className="mb-4 text-xs tracking-[0.5em] text-gold">WELCOME TO THE KING&rsquo;S APARTMENT</p>
        <h1 className="max-w-3xl text-4xl leading-tight sm:text-6xl">A stay fit for a king, in the city you need.</h1>
        <p className="mt-5 max-w-xl text-lg text-white/70">Comfortable, secure apartments across our branches. Choose your branch, pick your dates, pay online, and follow your booking until you check in.</p>
      </div>
      <div className="h-2 bg-gold" />
      <form onSubmit={go} className="relative mx-auto -mt-12 max-w-5xl px-5 pb-0 sm:-mt-[3.25rem]">
        <div className="grid gap-3 rounded-2xl bg-white p-4 text-navy shadow-xl sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_.7fr_auto]">
          <label className="text-xs text-navy/60"><span className="mb-1 flex items-center gap-1"><MapPin size={12} />Branch</span>
            <select className="input" value={f.branch} onChange={(e) => setF({ ...f, branch: e.target.value })}><option value="">Any branch</option>{branches.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}</select></label>
          <label className="text-xs text-navy/60"><span className="mb-1 flex items-center gap-1"><CalendarDays size={12} />Check in</span>
            <input className="input" type="date" min={today()} value={f.checkIn} onChange={(e) => setF({ ...f, checkIn: e.target.value, checkOut: e.target.value >= f.checkOut ? plus(e.target.value, 1) : f.checkOut })} /></label>
          <label className="text-xs text-navy/60"><span className="mb-1 flex items-center gap-1"><CalendarDays size={12} />Check out</span>
            <input className="input" type="date" min={plus(f.checkIn, 1)} value={f.checkOut} onChange={(e) => setF({ ...f, checkOut: e.target.value })} /></label>
          <label className="text-xs text-navy/60"><span className="mb-1 flex items-center gap-1"><Users size={12} />Guests</span>
            <input className="input" type="number" min={1} max={6} value={f.guests} onChange={(e) => setF({ ...f, guests: +e.target.value || 1 })} /></label>
          <button className="btn-gold self-end py-3">Check availability</button>
        </div>
      </form>
    </section>
  );
}
