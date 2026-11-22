import Link from 'next/link';
import Logo from './Logo';
export default function PublicHeader() {
  return (
    <header className="border-b-4 border-gold bg-navy text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Logo light />
        <nav aria-label="Main" className="flex items-center gap-2 text-sm">
          <Link href="/" className="btn text-white hover:bg-white/10">Home</Link>
          <Link href="/book" className="btn text-white hover:bg-white/10">Book</Link>
          <Link href="/track" className="btn-gold">Track booking</Link>
        </nav>
      </div>
    </header>
  );
}
