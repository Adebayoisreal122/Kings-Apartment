'use client';
import { useState } from 'react';
import { uploadImage } from '@/lib/api';
export default function ImageUpload({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); e.target.value = '';
    setBusy(true); setErr('');
    try { const urls: string[] = []; for (const f of files) urls.push(await uploadImage(f)); onChange([...value, ...urls]); }
    catch (x: any) { setErr(x.message); }
    setBusy(false);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((u, i) => (
          <div key={u} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-20 w-28 rounded-lg object-cover" />
            <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-navy text-xs text-white">×</button>
          </div>
        ))}
        <label className="flex h-20 w-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-navy/30 text-xs text-navy/60 hover:bg-navy-50">
          {busy ? 'Uploading…' : '+ Add photos'}
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={pick} disabled={busy} />
        </label>
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
    </div>
  );
}
