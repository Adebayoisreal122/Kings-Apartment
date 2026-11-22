export const API = process.env.NEXT_PUBLIC_API_URL || 'https://kings-back-a41w.onrender.com';
export const getToken = () => (typeof window === 'undefined' ? null : localStorage.getItem('ka_token'));
export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}/api${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opts.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}
export const naira = (n: number) => '₦' + Number(n || 0).toLocaleString('en-NG');
export async function downloadCsv(path: string, name: string) {
  const res = await fetch(`${API}/api${path}`, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new Error('Export failed. Try again.');
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
export async function uploadImage(file: File): Promise<string> {
  const fd = new FormData(); fd.append('image', file);
  const res = await fetch(`${API}/api/uploads`, { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` }, body: fd });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.message || 'Upload failed');
  return d.url;
}
