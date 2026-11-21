'use client';
import { useState } from 'react';
import Stars from './Stars';
import { api } from '@/lib/api';
export default function ReviewForm({ booking, onDone }: { booking: string; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [err, setErr] = useState('');
  const send = async (e: React.FormEvent) => {
    e.preventDefault(); setErr('');
    try { await api('/reviews', { method: 'POST', body: JSON.stringify({ booking, rating, comment: comment || undefined }) }); onDone(); } catch (x: any) { setErr(x.message); }
  };
  return (
    <form onSubmit={send} className="space-y-2 rounded-xl bg-navy-50 p-4">
      <p className="text-sm font-medium">How was your stay?</p>
      <Stars value={rating} onChange={setRating} />
      <textarea className="input" rows={2} maxLength={1000} placeholder="Tell other guests what you liked (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
      {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
      <button className="btn-gold" disabled={!rating}>Post review</button>
    </form>
  );
}
