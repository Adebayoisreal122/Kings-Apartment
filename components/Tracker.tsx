// Booking progress: Booked > Confirmed > Checked in > Checked out
const steps = [['pending', 'Booked'], ['confirmed', 'Confirmed'], ['checked_in', 'Checked in'], ['checked_out', 'Checked out']];
export default function Tracker({ status }: { status: string }) {
  if (status === 'cancelled') return <p className="text-sm text-red-700">This booking was cancelled.</p>;
  const at = steps.findIndex(([k]) => k === status);
  return (
    <ol className="flex items-center gap-2" aria-label="Booking progress">
      {steps.map(([k, label], i) => (
        <li key={k} className="flex flex-1 items-center gap-2">
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${i <= at ? 'bg-gold text-navy' : 'bg-navy-100 text-navy/50'}`}>{i < at ? '✓' : i + 1}</span>
          <span className={`text-xs ${i <= at ? 'font-medium' : 'text-navy/50'}`}>{label}</span>
          {i < steps.length - 1 && <span className={`h-px flex-1 ${i < at ? 'bg-gold' : 'bg-navy/15'}`} />}
        </li>
      ))}
    </ol>
  );
}
