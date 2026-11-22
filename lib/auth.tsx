'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';

export type Role = 'branch_manager' | 'admin';
type User = { id: string; name: string; email: string; phone?: string; role: Role; branch?: string; branchName?: string };
const Ctx = createContext<{ user: User | null; setUser: (u: User) => void; loading: boolean; login: (e: string, p: string) => Promise<void>; logout: () => void }>(null as any);
export const home = (r: Role) => (r === 'admin' ? '/admin' : '/manager');

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem('ka_token')) return setLoading(false);
    api('/auth/me').then((d) => setUser(d.user)).catch(() => localStorage.removeItem('ka_token')).finally(() => setLoading(false));
  }, []);
  const finish = (d: any, to?: string) => { localStorage.setItem('ka_token', d.token); setUser(d.user); router.push(to || home(d.user.role)); };
  const login = async (email: string, password: string) => finish(await api('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }));
    const logout = () => { localStorage.removeItem('ka_token'); setUser(null); router.push('/'); };
  return <Ctx.Provider value={{ user, setUser, loading, login, logout }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
