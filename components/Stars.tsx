export default function Stars({ value, onChange }: { value: number; onChange?: (n: number) => void }) {
  if (!onChange) return <span role="img" aria-label={`${value} out of 5 stars`} className="text-gold">{[1, 2, 3, 4, 5].map((n) => (n <= Math.round(value) ? '★' : '☆')).join('')}</span>;
  return (
    <span role="radiogroup" aria-label="Rating" className="inline-flex text-gold">
      {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={n === value} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)} className="text-2xl leading-none">{n <= value ? '★' : '☆'}</button>)}
    </span>
  );
}
