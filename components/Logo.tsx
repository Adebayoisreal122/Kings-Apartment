import Link from 'next/link';
export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="The King's Apartment home">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/logo-mark.png" alt="" width={40} height={40} />
      <span className={`font-display leading-none ${light ? 'text-white' : 'text-navy'}`}>
        <span className="block text-lg font-light tracking-[0.12em]">THE KING&rsquo;S</span>
        <span className="block text-[10px] tracking-[0.5em] text-gold-muted">APARTMENT</span>
      </span>
    </Link>
  );
}
