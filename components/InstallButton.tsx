'use client';
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
// Shows only when the browser says the app can be installed.
export default function InstallButton({ className = '' }: { className?: string }) {
  const [evt, setEvt] = useState<any>(null);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  if (!evt) return null;
  return <button className={className} onClick={async () => { evt.prompt(); await evt.userChoice; setEvt(null); }}><Download size={16} className="mr-2" />Install app</button>;
}
