'use client';
import { useCallback, useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import Stars from '@/components/Stars';
import { api } from '@/lib/api';

export default function Reviews() {
  const [list, setList] = useState<any[]>([]);
  const load = useCallback(() => api('/admin/reviews').then(setList), []);
  useEffect(() => { load().catch(() => {}); }, [load]);
  const toggle = (r: any) => api(`/admin/reviews/${r._id}`, { method: 'PATCH', body: JSON.stringify({ hidden: !r.hidden }) }).then(load);
  return (
    <Shell role="admin" title="Guest reviews">
      <div className="space-y-3">
        {list.map((r) => (
          <div key={r._id} className={`card flex flex-wrap items-start justify-between gap-3 ${r.hidden ? 'opacity-60' : ''}`}>
            <div><Stars value={r.rating} /> <span className="text-sm text-navy/60">{r.customer?.name} · {r.branch?.name} · {new Date(r.createdAt).toLocaleDateString()}</span>
              <p className="mt-1 text-sm">{r.comment || <i className="text-navy/50">No comment</i>}</p></div>
            <button className="btn-ghost !px-4 !py-1.5" onClick={() => toggle(r)}>{r.hidden ? 'Show to guests' : 'Hide'}</button>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-navy/60">No reviews yet. Guests can review a stay after they check out.</p>}
      </div>
    </Shell>
  );
}
