'use client';
import { useCallback, useEffect, useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import Shell from '@/components/Shell';
import ImageUpload from '@/components/ImageUpload';
import { api } from '@/lib/api';

const blank = { name: '', city: '', state: '', address: '', phone: '', description: '', amenitiesText: 'Wi-Fi, Power 24/7, Parking', images: [] as string[], active: true };
export default function Branches() {
  const [list, setList] = useState<any[]>([]);
  const [d, setD] = useState<any | null>(null);
  const [msg, setMsg] = useState('');
  const load = useCallback(() => api('/admin/branches').then(setList).catch((e) => setMsg(e.message)), []);
  useEffect(() => { load(); if (location.search.includes('new=1')) setD({ ...blank }); }, [load]);
  const edit = (b: any) => setD({ ...b, amenitiesText: (b.amenities || []).join(', '), images: b.images || [] });
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setMsg('');
    const { _id, amenitiesText, amenities, __v, createdAt, updatedAt, ...rest } = d;
    const body = JSON.stringify({ ...rest, amenities: amenitiesText.split(',').map((x: string) => x.trim()).filter(Boolean) });
    try { await api(_id ? `/admin/branches/${_id}` : '/admin/branches', { method: _id ? 'PUT' : 'POST', body }); setMsg(_id ? 'Branch saved.' : 'Branch added. Next, add its room types and rooms under Rooms & rates, and a manager under Managers.'); setD(null); load(); }
    catch (x: any) { setMsg(x.message); }
  };
  const f = (k: string) => ({ value: d?.[k] || '', onChange: (e: any) => setD({ ...d, [k]: e.target.value }) });
  return (
    <Shell role="admin" title="Branches" subtitle="Add branches and keep their details and photos up to date" actions={<button className="btn-gold" onClick={() => setD({ ...blank })}><Plus size={16} className="mr-1" />Add branch</button>}>
      {msg && <p role="status" className="mb-4 rounded-xl bg-gold-soft p-3 text-sm">{msg}</p>}
      {d && (
        <form onSubmit={save} className="card mb-6 space-y-3">
          <h2 className="text-xl">{d._id ? `Edit ${d.name}` : 'New branch'}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Branch name, e.g. The King's Apartment, Ibadan" required {...f('name')} /><input className="input" placeholder="City" required {...f('city')} />
            <input className="input" placeholder="State" {...f('state')} /><input className="input" placeholder="Phone" {...f('phone')} />
            <input className="input sm:col-span-2" placeholder="Address" required {...f('address')} />
            <textarea className="input sm:col-span-2" rows={3} placeholder="Short description" {...f('description')} />
            <input className="input sm:col-span-2" placeholder="Amenities, separated by commas" value={d.amenitiesText} onChange={(e) => setD({ ...d, amenitiesText: e.target.value })} />
          </div>
          <p className="text-sm text-navy/60">Photos (the first one is the cover)</p>
          <ImageUpload value={d.images} onChange={(images) => setD({ ...d, images })} />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.active} onChange={(e) => setD({ ...d, active: e.target.checked })} /> Show this branch to guests</label>
          <div className="flex gap-2"><button className="btn-gold">{d._id ? 'Save branch' : 'Add branch'}</button><button type="button" className="btn-ghost" onClick={() => setD(null)}>Cancel</button></div>
        </form>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        {list.map((b) => (
          <div key={b._id} className="card flex gap-4">
            {b.images?.[0] ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={b.images[0]} alt="" className="h-24 w-32 rounded-xl object-cover" /> : <div className="flex h-24 w-32 items-center justify-center rounded-xl bg-navy text-[10px] tracking-[0.3em] text-gold">{b.city?.toUpperCase()}</div>}
            <div className="min-w-0 flex-1"><h3 className="truncate text-lg">{b.name}</h3><p className="flex items-center gap-1 truncate text-sm text-navy/60"><MapPin size={13} />{b.address}, {b.city}</p><p className="text-xs text-navy/50">{b.images?.length || 0} photos{b.active ? '' : ' · hidden from guests'}</p>
              <button className="btn-ghost mt-2 !px-4 !py-1" onClick={() => edit(b)}>Edit</button></div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-navy/60">No branches yet. Add your first branch.</p>}
      </div>
    </Shell>
  );
}
