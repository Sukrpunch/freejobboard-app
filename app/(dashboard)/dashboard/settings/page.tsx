import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { saveSettings } from './actions';

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: board } = await supabase.from('boards').select('*').eq('owner_id', user.id).single();
  if (!board) redirect('/register');

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
        <div>
          <label className={LABEL}>Custom Domain</label>
          <input type="text" name="custom_domain" defaultValue={board.custom_domain ?? ''} placeholder="jobs.yoursite.com" className={INPUT} />
          <p className="text-xs text-slate-400 mt-1.5">Add a CNAME record: <code className="bg-slate-100 px-1 rounded">jobs.yoursite.com → cname.freejobboard.ai</code></p>
        </div>
        <button type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
          Save Settings
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2">
        <h2 className="font-semibold text-slate-900">Board URL</h2>
        <p className="text-sm text-slate-600">
          Your board is live at:{' '}
          <a href={`https://${board.slug}.freejobboard.ai`} target="_blank" rel="noopener noreferrer"
            className="text-indigo-600 hover:underline font-medium">{board.slug}.freejobboard.ai</a>
        </p>
        <p className="text-xs text-slate-400">Your slug (<strong>{board.slug}</strong>) cannot be changed after creation.</p>
      </div>
    </div>
  );
}
