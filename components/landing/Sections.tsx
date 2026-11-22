import Link from 'next/link';
import { BedDouble, CalendarCheck, CreditCard, Car, ShieldCheck, Wifi, Zap, Waves, Wind, UtensilsCrossed, WashingMachine, Headset, MapPin, Phone, Star, type LucideIcon } from 'lucide-react';
import Logo from '../Logo';
import { naira } from '@/lib/api';

export const Heading = ({ eyebrow, title, text, light = false }: { eyebrow: string; title: string; text?: string; light?: boolean }) => (
  <div className="mx-auto mb-12 max-w-2xl text-center">
    <p className="mb-3 text-xs tracking-[0.5em] text-gold-muted">{eyebrow}</p>
    <h2 className={`text-3xl sm:text-4xl ${light ? 'text-white' : ''}`}>{title}</h2>
    {text && <p className={`mt-4 ${light ? 'text-white/70' : 'text-navy/70'}`}>{text}</p>}
  </div>
);

export function About() {
  const points = [['Safe and secure', ShieldCheck], ['Power and water you can rely on', Zap], ['Easy online booking and payment', CreditCard], ['Friendly front desk teams', Headset]] as [string, LucideIcon][];
  return (
    <section id="about" className="scroll-mt-20 bg-white py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2">
        <div className="relative mx-auto w-full max-w-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/building.jpg" alt="The King's Apartment building" className="h-[420px] w-full rounded-3xl object-cover" />
          <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border-4 border-white bg-navy p-5 text-white shadow-xl sm:block"><p className="font-display text-3xl font-light text-gold">24/7</p><p className="text-xs text-white/70">Front desk and security</p></div>
        </div>
        <div>
          <p className="mb-3 text-xs tracking-[0.5em] text-gold-muted">ABOUT US</p>
          <h2 className="text-3xl sm:text-4xl">Your home away from home, run with care.</h2>
          <p className="mt-5 text-navy/70">The King&rsquo;s Apartment offers clean, comfortable and secure apartments in more than one city. Every branch is run by its own manager, so you get real attention from a team that knows the place.</p>
          <p className="mt-3 text-navy/70">Whether you are in town for business, a short break or a longer stay, you can book in a few minutes and see every step of your booking until you walk through the door.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">{points.map(([t, Icon]) => <li key={t} className="flex items-center gap-3 text-sm"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-soft text-gold-muted"><Icon size={18} /></span>{t}</li>)}</ul>
          <Link href="/book" className="btn-navy mt-8">Book your stay</Link>
        </div>
      </div>
    </section>
  );
}

const SAMPLES = [
  { name: 'Classic Studio', text: 'A bright, efficient space with a comfortable bed, work desk and everything for a short stay.', capacity: 2, img: '/rooms/classic-studio.svg' },
  { name: 'Executive Suite', text: 'A separate lounge area and generous bedroom, made for longer stays and families.', capacity: 3, img: '/rooms/executive-suite.svg' },
];
export function Rooms({ rooms }: { rooms: any[] }) {
  const cards = rooms.length ? rooms.map((r) => ({ key: r._id, name: r.name, text: r.description || `At ${r.branch.name}, ${r.branch.city}.`, capacity: r.capacity, img: r.images?.[0] || '/rooms/classic-studio.svg', price: r.pricePerNight, place: r.branch.name })) : SAMPLES.map((s) => ({ ...s, key: s.name, price: 0, place: '' }));
  return (
    <section id="rooms" className="scroll-mt-20 bg-navy-50 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Heading eyebrow="ROOMS & SUITES" title="Rooms for every kind of stay" text="From a quick overnight to a longer stay, pick the space that suits you." />
        <div className="grid gap-6 md:grid-cols-3">
          {cards.slice(0, 6).map((c) => (
            <article key={c.key} className="group overflow-hidden rounded-3xl border border-navy/10 bg-white transition-shadow hover:shadow-xl">
              <div className="overflow-hidden bg-navy">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={c.img} alt={c.name} className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
              <div className="p-6">
                <h3 className="text-xl">{c.name}</h3>
                {c.place && <p className="mt-1 flex items-center gap-1 text-xs text-navy/60"><MapPin size={12} />{c.place}</p>}
                <p className="mt-3 text-sm text-navy/70">{c.text}</p>
                <div className="mt-5 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-navy/60"><BedDouble size={16} />Sleeps {c.capacity}</span>
                  {c.price > 0 ? <span className="text-lg">{naira(c.price)}<span className="text-xs text-navy/60"> / night</span></span> : <Link href="/book" className="text-sm underline">Book now</Link>}
                </div>
              </div>
            </article>
          ))}
        </div>
        {!rooms.length && <p className="mt-6 text-center text-xs text-navy/50">Sample illustrations. Real photos and prices appear here once rooms are added in the admin panel.</p>}
        <div className="mt-10 text-center"><Link href="/book" className="btn-gold">Book a room</Link></div>
      </div>
    </section>
  );
}

export function Branches({ branches }: { branches: any[] }) {
  return (
    <section id="branches" className="scroll-mt-20 bg-white py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Heading eyebrow="OUR BRANCHES" title="Find us in your city" text="Each branch has its own team, rooms and rates." />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((b) => (
            <article key={b._id} className="overflow-hidden rounded-3xl border border-navy/10 bg-white">
              {b.images?.[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.images[0]} alt="" className="h-44 w-full object-cover" /> : <div className="flex h-44 items-center justify-center bg-gradient-to-br from-navy-600 to-navy"><span className="font-display text-xl font-light tracking-[0.2em] text-gold/80">{(b.area || b.city).toUpperCase()}</span></div>}
              <div className="p-6">
                {b.isHeadOffice && <span className="badge mb-2 bg-gold-soft text-gold-muted">Head office</span>}
                <h3 className="text-xl">{b.name}</h3>
                <p className="mt-1 flex items-start gap-1 text-sm text-navy/60"><MapPin size={14} className="mt-0.5 shrink-0" />{b.address}</p>
                {b.rating && <p className="mt-2 text-sm"><span className="text-gold">★</span> {b.rating} · {b.reviews} review{b.reviews === 1 ? '' : 's'}</p>}
                <div className="mt-4 flex items-center justify-between">{b.priceFrom ? <span className="text-sm">From <b>{naira(b.priceFrom)}</b> / night</span> : <span />}<Link href={`/book?branch=${b._id}`} className="btn-ghost !px-4 !py-1.5">Book here</Link></div>
              </div>
            </article>
          ))}
          {branches.length === 0 && <p className="col-span-full text-center text-sm text-navy/60">Our branches will be listed here soon.</p>}
        </div>
      </div>
    </section>
  );
}

const AMEN: [string, LucideIcon][] = [['Free Wi-Fi', Wifi], ['Steady power', Zap], ['Secure parking', Car], ['Swimming pool', Waves], ['Air conditioning', Wind], ['Restaurant', UtensilsCrossed], ['Laundry', WashingMachine], ['24/7 security', ShieldCheck]];
export function StayLonger({ discounts }: { discounts: any[] }) {
  if (!discounts.length) return null;
  const top = [...discounts].sort((a, b) => a.minNights - b.minNights);
  return (
    <section className="bg-gold py-14 text-navy">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5">
        <div><p className="mb-2 text-xs tracking-[0.5em]">STAY LONGER, PAY LESS</p><h2 className="text-3xl">{top.map((d) => `${d.minNights}+ nights: ${d.percent}% off`).join(' · ')}</h2><p className="mt-1 text-navy/80">The discount is added automatically when you choose your dates.</p></div>
        <Link href="/book" className="btn-navy py-3">Check my price</Link>
      </div>
    </section>
  );
}

export function Amenities() {
  return (
    <section id="amenities" className="scroll-mt-20 bg-navy py-20 text-white">
      <div className="mx-auto max-w-6xl px-5">
        <Heading light eyebrow="AMENITIES" title="Everything you need for a smooth stay" text="Amenities can differ by branch. Check the branch page before you book." />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{AMEN.map(([t, Icon]) => <div key={t} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"><span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold"><Icon size={22} /></span><p className="text-sm">{t}</p></div>)}</div>
      </div>
    </section>
  );
}

const STEPS: [string, string, LucideIcon][] = [['Choose a branch', 'Pick the branch and dates that suit you.', MapPin], ['Book and pay', 'Give your name and phone number, then pay securely online.', CreditCard], ['Get confirmed', 'The branch confirms and texts you on your phone.', CalendarCheck], ['Check in', 'Arrive and your room is ready for you.', BedDouble]];
export function HowItWorks() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Heading eyebrow="HOW IT WORKS" title="Booking takes four easy steps" />
        <ol className="grid gap-6 md:grid-cols-4">{STEPS.map(([t, d, Icon], i) => (
          <li key={t} className="relative rounded-3xl bg-navy-50 p-6">
            <span className="absolute right-5 top-4 font-display text-5xl font-light text-navy/10">{i + 1}</span>
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold text-navy"><Icon size={22} /></span>
            <h3 className="text-lg">{t}</h3><p className="mt-1 text-sm text-navy/70">{d}</p>
          </li>))}
        </ol>
      </div>
    </section>
  );
}

export function Reviews({ reviews }: { reviews: any[] }) {
  if (!reviews.length) return null;
  return (
    <section className="bg-navy-50 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <Heading eyebrow="GUEST REVIEWS" title="What our guests say" />
        <div className="grid gap-5 md:grid-cols-3">{reviews.slice(0, 3).map((v) => (
          <figure key={v._id} className="rounded-3xl border border-navy/10 bg-white p-6">
            <div className="flex gap-0.5 text-gold" aria-label={`${v.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill={i < v.rating ? 'currentColor' : 'none'} />)}</div>
            <blockquote className="mt-3 text-sm text-navy/80">{v.comment || 'A wonderful stay.'}</blockquote>
            <figcaption className="mt-4 text-xs text-navy/60">{v.name}{v.branchName ? ` · ${v.branchName}` : ''}</figcaption>
          </figure>))}
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  ['Do I need an account to book?', 'No. Choose your room, then give your name and phone number. We text your booking details to that number.'],
  ['How do I know my booking is confirmed?', 'The branch confirms your booking and sends you an SMS. You can also open Track booking at any time with your booking reference and phone number.'],
  ['Do you offer discounts for longer stays?', 'Yes. Longer stays get an automatic discount. You will see it in your price when you choose your dates.'],
  ['What are the check-in and check-out times?', 'Check-in is usually from 2:00 PM and check-out by 12:00 noon. Each branch shows its own times.'],
  ['Can I cancel a booking?', 'Yes, from Track booking while it is waiting for payment or confirmation. If you have already paid, call the branch and they will help you.'],
  ['How do I pay?', 'Payments are made online with Paystack using your card, bank transfer or other options it offers.'],
  ['Can I use a coupon?', 'Yes. Enter your coupon code on the booking page and the discount shows before you book.'],
];
export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 bg-white py-20">
      <div className="mx-auto max-w-3xl px-5">
        <Heading eyebrow="FAQ" title="Questions guests often ask" />
        <div className="divide-y divide-navy/10 rounded-3xl border border-navy/10">{FAQ.map(([q, a]) => (
          <details key={q} className="group p-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">{q}<span className="text-xl text-gold-muted transition-transform group-open:rotate-45" aria-hidden>+</span></summary><p className="mt-3 text-sm text-navy/70">{a}</p></details>))}
        </div>
      </div>
    </section>
  );
}

export function CtaAndFooter({ branches }: { branches: any[] }) {
  return (
    <>
      <section className="bg-gold py-14 text-navy"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-5"><div><h2 className="text-3xl">Ready for your stay?</h2><p className="mt-1 text-navy/80">No account needed. Just your name and phone number.</p></div><Link href="/book" className="btn-navy py-3">Book your stay</Link></div></section>
      <footer id="contact" className="scroll-mt-20 bg-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-3">
          <div><Logo light /><p className="mt-4 max-w-xs text-sm text-white/60">Comfortable, secure apartments across our branches.</p></div>
          <div><h3 className="mb-3 text-sm tracking-[0.3em] text-gold">EXPLORE</h3><ul className="space-y-2 text-sm text-white/70">{[['#about', 'About'], ['#rooms', 'Rooms'], ['#branches', 'Branches'], ['#faq', 'FAQ']].map(([h, l]) => <li key={h}><a href={h} className="hover:text-gold">{l}</a></li>)}<li><Link href="/track" className="hover:text-gold">Track booking</Link></li><li><Link href="/login" className="hover:text-gold">Staff login</Link></li></ul></div>
          <div><h3 className="mb-3 text-sm tracking-[0.3em] text-gold">CONTACT</h3><ul className="space-y-3 text-sm text-white/70">{branches.map((b) => <li key={b._id}><p className="text-white">{b.name}</p><p className="flex items-start gap-1"><MapPin size={14} className="mt-0.5 shrink-0" />{b.address}</p>{b.phone && <p className="flex items-center gap-1"><Phone size={14} /><a href={`tel:${b.phone}`} className="hover:text-gold">{b.phone}</a></p>}</li>)}</ul></div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">© {new Date().getFullYear()} The King&rsquo;s Apartment. All rights reserved.</div>
      </footer>
    </>
  );
}
