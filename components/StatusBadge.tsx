const tone: Record<string, string> = {
  pending: 'bg-gold-soft text-gold-muted', confirmed: 'bg-navy-100 text-navy-600', checked_in: 'bg-emerald-100 text-emerald-800',
  checked_out: 'bg-navy-50 text-navy/60', cancelled: 'bg-red-100 text-red-700', paid: 'bg-emerald-100 text-emerald-800', unpaid: 'bg-gold-soft text-gold-muted',
};
export default function StatusBadge({ s }: { s: string }) {
  return <span className={`badge ${tone[s] || ''}`}>{s.replace('_', ' ')}</span>;
}
