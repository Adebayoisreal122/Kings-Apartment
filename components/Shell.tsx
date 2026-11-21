'use client';
import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BedDouble, Building2, CalendarCheck, FileDown, LayoutDashboard, LogOut, Menu, Search, Star, Ticket, User, UserCog, X, type LucideIcon } from 'lucide-react';
import { Role, useAuth, home } from '@/lib/auth';
import Logo from './Logo';
import Bell from './Bell';
import PushToggle from './PushToggle';

type Item = { href: string; label: string; icon: LucideIcon };
const NAV: Record<Role, Item[]> = {
  admin: [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard }, { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
    { href: '/admin/branches', label: 'Branches', icon: Building2 }, { href: '/admin/managers', label: 'Managers', icon: UserCog },
    { href: '/admin/rooms', label: 'Rooms & rates', icon: BedDouble }, { href: '/admin/coupons', label: 'Coupons', icon: Ticket },
    { href: '/admin/reviews', label: 'Reviews', icon: Star }, { href: '/admin/reports', label: 'Reports', icon: FileDown },
  ],
  branch_manager: [
    { href: '/manager', label: 'Overview', icon: LayoutDashboard }, { href: '/manager/bookings', label: 'Bookings', icon: CalendarCheck },
    { href: '/manager/rooms', label: 'Rooms', icon: BedDouble }, { href: '/manager/reports', label: 'Reports', icon: FileDown },
  ],
  customer: [
    { href: '/dashboard', label: 'Book a stay', icon: Search }, { href: '/dashboard/bookings', label: 'My bookings', icon: CalendarCheck },
    { href: '/dashboard/profile', label: 'Profile', icon: User },
  ],
};
const ROOT = ['/admin', '/manager', '/dashboard'];

// Shared dashboard layout: navy sidebar (drawer on phones), light top bar, content area.
export default function Shell({ role, title, subtitle, actions, children }: { role: Role; title: string; subtitle?: string; actions?: ReactNode; children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (user.role !== role) router.replace(home(user.role));
  }, [user, loading, role, router]);
  useEffect(() => setOpen(false), [path]);
  if (!user || user.role !== role) return <div className="p-10 text-sm text-navy/60">Loading…</div>;

  const roleLabel = role === 'admin' ? 'Head office' : role === 'branch_manager' ? `Manager · ${user.branchName || 'Branch'}` : 'Guest';
  const active = (h: string) => (ROOT.includes(h) ? path === h : path.startsWith(h));
  const side = (
    <div className="flex h-full flex-col bg-navy text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5"><Logo light /><button className="lg:hidden" aria-label="Close menu" onClick={() => setOpen(false)}><X size={20} /></button></div>
      <nav aria-label="Main" className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV[role].map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${active(href) ? 'bg-gold font-medium text-navy' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            <Icon size={18} />{label}
          </Link>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold font-medium text-navy">{user.name.charAt(0).toUpperCase()}</span>
          <div className="min-w-0"><p className="truncate text-sm">{user.name}</p><p className="truncate text-xs text-white/60">{roleLabel}</p></div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"><LogOut size={16} />Sign out</button>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-navy-50 lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{side}</aside>
      {open && <div className="fixed inset-0 z-40 lg:hidden"><button aria-label="Close menu" className="absolute inset-0 bg-navy/60" onClick={() => setOpen(false)} /><aside className="relative h-full w-72 max-w-[85%]">{side}</aside></div>}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-navy/10 bg-white/90 px-5 py-3 backdrop-blur">
        <button className="rounded-full p-2 hover:bg-navy-50 lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={20} /></button>
        <div className="min-w-0 flex-1"><h1 className="truncate text-2xl leading-tight">{title}</h1>{subtitle && <p className="truncate text-sm text-navy/60">{subtitle}</p>}</div>
        <PushToggle /><Bell />
      </header>
      <main className="mx-auto max-w-6xl px-5 py-6">
        {actions && <div className="mb-5 flex flex-wrap items-center justify-end gap-2">{actions}</div>}
        {children}
      </main>
    </div>
  );
}
