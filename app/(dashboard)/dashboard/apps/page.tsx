import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AVAILABLE_APPS } from '@/types';

export default async function AppsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: board } = await supabase.from('boards').select('id').eq('owner_id', user.id).single();
  if (!board) redirect('/register');

  const { data: installedApps } = await supabase
    .from('board_apps').select('app_slug').eq('board_id', board.id).eq('active', true);

  const installed = new Set(installedApps?.map(a => a.app_slug) ?? []);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">App Store</h1>
        <p className="text-slate-500 text-sm mt-1">Extend your board. Install what you need, when you need it.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {AVAILABLE_APPS.map(app => {
          const isInstalled = installed.has(app.slug);
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
                className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isInstalled
                    ? 'bg-slate-100 text-slate-500 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
                disabled={isInstalled}>
                {isInstalled ? 'Installed' : 'Install — Coming Soon'}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-400 text-center">
        Stripe billing for apps launches with beta. All apps free during beta testing.
      </p>
    </div>
  );
}
