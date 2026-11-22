'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from '../Logo';
import InstallButton from '../InstallButton';
import { useAuth, home } from '@/lib/auth';

const links = [['#about', 'About'], ['#rooms', 'Rooms'], ['#branches', 'Branches'], ['#amenities', 'Amenities'], ['#faq', 'FAQ'], ['#contact', 'Contact']];
export default function Nav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const cta = <><Link className="btn text-white hover:bg-white/10" href="/track">Track booking</Link>{user && <Link className="btn border border-white/30 text-white hover:bg-white/10" href={home(user.role)}>Dashboard</Link>}<Link className="btn-gold" href="/book">Book now</Link></>;
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-navy/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Logo light />
        <nav aria-label="Main" className="hidden items-center gap-6 text-sm text-white/80 lg:flex">{links.map(([h, l]) => <a key={h} href={h} className="hover:text-gold">{l}</a>)}</nav>
        <div className="hidden items-center gap-2 lg:flex"><InstallButton className="btn border border-white/30 text-white hover:bg-white/10" />{cta}</div>
        <button className="lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      </div>
      {open && (
        <div className="space-y-1 border-t border-white/10 px-5 pb-5 pt-3 lg:hidden">
          {links.map(([h, l]) => <a key={h} href={h} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-white/80 hover:bg-white/10">{l}</a>)}
          <div className="flex flex-wrap gap-2 pt-3"><InstallButton className="btn border border-white/30 text-white" />{cta}</div>
        </div>
      )}
    </header>
  );
}
