import type { LucideIcon } from 'lucide-react';
export default function StatCard({ label, value, icon: Icon, tone = 'gold', hint }: { label: string; value: string | number; icon: LucideIcon; tone?: 'gold' | 'navy' | 'green'; hint?: string }) {
  const c = { gold: 'bg-gold-soft text-gold-muted', navy: 'bg-navy-100 text-navy-600', green: 'bg-emerald-100 text-emerald-700' }[tone];
  return (
    <div className="card flex items-center gap-4">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c}`}><Icon size={22} /></span>
      <div className="min-w-0"><p className="truncate text-sm text-navy/60">{label}</p><p className="font-display text-3xl font-light leading-tight">{value}</p>{hint && <p className="text-xs text-navy/50">{hint}</p>}</div>
    </div>
  );
}
