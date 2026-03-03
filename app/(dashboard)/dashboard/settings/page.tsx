import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { saveSettings } from './actions';
import Link from 'next/link';
import { Lock } from 'lucide-react';

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: board } = await supabase.from('boards').select('*').eq('owner_id', user.id).single();
  if (!board) redirect('/register');

  const { data: domainApp } = await supabase.from('board_apps')
    .select('id').eq('board_id', board.id).eq('app_slug', 'custom-domain').eq('active', true).single();

  const hasDomainApp = !!domainApp;

  const sp = await searchParams;
  const INPUT = 'w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';
  const LABEL = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Board Settings</h1>

      {sp.saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
          ✓ Settings saved.
        </div>
      )}

      <form action={saveSettings} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <input type="hidden" name="board_id" value={board.id} />
        <div>
          <label className={LABEL}>Board Name *</label>
          <input type="text" name="name" required defaultValue={board.name} className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Tagline</label>
          <input type="text" name="tagline" defaultValue={board.tagline ?? ''} placeholder="The best jobs in your niche" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Category</label>
          <input type="text" name="category" defaultValue={board.category ?? ''} placeholder="e.g. Climate Tech, Web3, Healthcare" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Primary Color</label>
          <div className="flex items-center gap-3">
            <input type="color" name="primary_color" defaultValue={board.primary_color ?? '#6366f1'}
              className="h-10 w-16 rounded-lg border border-slate-300 cursor-pointer" />
            <span className="text-sm text-slate-500">Accent color for buttons and highlights</span>
          </div>
        </div>
        <button type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
          Save Settings
        </button>
      </form>

      {/* Board URL */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2">
        <h2 className="font-semibold text-slate-900">Your Board URL</h2>
        <p className="text-sm text-slate-600">
          Live at:{' '}
          <a href={`https://${board.slug}.freejobboard.ai`} target="_blank" rel="noopener noreferrer"
            className="text-indigo-600 hover:underline font-medium">{board.slug}.freejobboard.ai</a>
        </p>
        <p className="text-xs text-slate-400">Your slug (<strong>{board.slug}</strong>) cannot be changed after creation.</p>
      </div>

      {/* Custom Domain — gated */}
      <div className={`border rounded-2xl p-6 space-y-4 ${hasDomainApp ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              🌐 White-Label Domain
              {!hasDomainApp && <span className="text-xs font-semibold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">$9/mo</span>}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Replace <code className="bg-slate-100 px-1 rounded text-xs">{board.slug}.freejobboard.ai</code> with your own domain like <code className="bg-slate-100 px-1 rounded text-xs">yourboard.com</code>
            </p>
          </div>
          {!hasDomainApp && <Lock size={16} className="text-slate-400 flex-shrink-0" />}
        </div>

        {hasDomainApp ? (
          <form action={saveSettings} className="space-y-3">
            <input type="hidden" name="board_id" value={board.id} />
            <div>
              <label className={LABEL}>Custom Domain</label>
              <input type="text" name="custom_domain" defaultValue={board.custom_domain ?? ''} placeholder="jobs.yoursite.com" className={INPUT} />
              <p className="text-xs text-slate-400 mt-1.5">
                Point your domain's nameservers to <code className="bg-slate-100 px-1 rounded">ns1.vercel-dns.com</code> and <code className="bg-slate-100 px-1 rounded">ns2.vercel-dns.com</code>. SSL is automatic.
              </p>
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition-colors">
              Save Domain
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-400 cursor-not-allowed flex items-center gap-2">
              <Lock size={13} /> jobs.yoursite.com
            </div>
            <Link href="/dashboard/apps"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-colors">
              Unlock White-Label Domain — $9/mo →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
