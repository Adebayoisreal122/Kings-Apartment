'use client';
import { useEffect, useState } from 'react';
import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import { About, Amenities, Branches, CtaAndFooter, Faq, HowItWorks, Reviews, Rooms } from '@/components/landing/Sections';
import { api } from '@/lib/api';

export default function Landing() {
  const [branches, setBranches] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  useEffect(() => {
    api('/branches').then(setBranches).catch(() => {});
    api('/branches/featured/rooms').then(setRooms).catch(() => {});
    api('/reviews?limit=6').then(setReviews).catch(() => {});
  }, []);
  return (
    <>
      <Nav />
      <main>
        <Hero branches={branches} />
        <About />
        <Rooms rooms={rooms} />
        <Branches branches={branches} />
        <Amenities />
        <HowItWorks />
        <Reviews reviews={reviews} />
        <Faq />
      </main>
      <CtaAndFooter branches={branches} />
    </>
  );
}
