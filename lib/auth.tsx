'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';

export type Role = 'customer' | 'branch_manager' | 'admin';
type User = { id: string; name: string; email: string; phone?: string; role: Role; branch?: string; branchName?: string };
const Ctx = createContext<{ user: User | null; setUser: (u: User) => void; loading: boolean; login: (e: string, p: string) => Promise<void>; register: (b: any, to?: string) => Promise<void>; logout: () => void }>(null as any);
export const home = (r: Role) => (r === 'admin' ? '/admin' : r === 'branch_manager' ? '/manager' : '/dashboard');

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
  const register = async (b: any, to?: string) => finish(await api('/auth/register', { method: 'POST', body: JSON.stringify(b) }), to);
  const logout = () => { localStorage.removeItem('ka_token'); setUser(null); router.push('/'); };
  return <Ctx.Provider value={{ user, setUser, loading, login, register, logout }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
