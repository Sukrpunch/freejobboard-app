'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AVAILABLE_APPS } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function AppsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const justInstalled = searchParams.get('installed');

  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);
  const [boardId, setBoardId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data: board } = await supabase.from('boards').select('id').eq('owner_id', user.id).single();
      if (!board) { router.push('/register'); return; }
      setBoardId(board.id);
      const { data: apps } = await supabase.from('board_apps')
        .select('app_slug').eq('board_id', board.id).eq('active', true);
      setInstalled(new Set(apps?.map(a => a.app_slug) ?? []));
    })();
  }, [router]);

  const handleInstall = async (slug: string) => {
    setLoading(slug);
    try {
      const res = await fetch('/api/apps/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app_slug: slug }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">App Store</h1>
        <p className="text-slate-500 text-sm mt-1">Extend your board. Install what you need, when you need it.</p>
      </div>

      {justInstalled && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm font-medium">
          <CheckCircle size={16} /> {AVAILABLE_APPS.find(a => a.slug === justInstalled)?.name} installed successfully!
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AVAILABLE_APPS.map(app => {
          const isInstalled = installed.has(app.slug);
          const isLoading = loading === app.slug;
          const hasPriceId = !!app.price_id;

          return (
            <div key={app.slug} className={`bg-white border rounded-2xl p-5 flex flex-col gap-3 ${isInstalled ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{app.icon}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{app.name}</h3>
                    <p className="text-indigo-600 font-bold text-sm">${app.price_monthly}<span className="text-slate-400 font-normal text-xs">/mo</span></p>
                  </div>
                </div>
                {isInstalled && <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">Active</span>}
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{app.description}</p>
              <button
                onClick={() => hasPriceId && !isInstalled && handleInstall(app.slug)}
                disabled={isInstalled || isLoading || !hasPriceId}
                className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isInstalled
                    ? 'bg-slate-100 text-slate-500 cursor-default'
                    : hasPriceId
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer disabled:opacity-60'
                    : 'bg-slate-100 text-slate-400 cursor-default'
                }`}>
                {isInstalled ? '✓ Installed' : isLoading ? 'Redirecting...' : hasPriceId ? `Install — $${app.price_monthly}/mo` : 'Coming Soon'}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Cancel anytime. Apps activate instantly after payment.
      </p>
    </div>
  );
}
