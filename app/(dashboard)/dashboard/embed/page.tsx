import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function EmbedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: board } = await supabase.from('boards').select('slug, name').eq('owner_id', user.id).single();
  if (!board) redirect('/register');

  const embedCode = `<div id="fjb-jobs"></div>\n<script\n  src="https://app.freejobboard.ai/embed/v1.js"\n  data-board="${board.slug}">\n</script>`;

  const INPUT = 'w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Embed Your Board</h1>
        <p className="text-slate-500 text-sm mt-1">
          Add your job listings to any website with one snippet of code. Free, always.
        </p>
      </div>

      {/* Embed code */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-slate-900 mb-1">Your embed code</h2>
          <p className="text-sm text-slate-500">Copy and paste this into any webpage where you want your jobs to appear.</p>
        </div>
        <textarea
          readOnly
          rows={5}
          className={INPUT}
          defaultValue={embedCode}
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />
        <p className="text-xs text-slate-400">Click the box to select all, then copy.</p>
      </div>

      {/* How it works */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-slate-900">How it works</h2>
        <div className="space-y-4">
          {[
            ['Paste anywhere', 'Works with WordPress, Squarespace, Webflow, Wix, Framer, or any custom HTML page.'],
            ['Always up to date', 'Jobs update automatically — no need to touch the embed code when you add or remove listings.'],
            ['Matches your brand', `The embed uses your board's accent color (${board.name}) and adapts to mobile screens.`],
          ].map(([title, desc]) => (
            <div key={title} className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
              <div>
                <p className="text-sm font-medium text-slate-800">{title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-indigo-900 text-sm">Live preview</p>
            <p className="text-indigo-700 text-xs mt-0.5">See what the embed looks like.</p>
          </div>
          <a href="/embed/demo" target="_blank" rel="noopener"
            className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
            Preview →
          </a>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-slate-900 text-sm">Installation guide</p>
            <p className="text-slate-500 text-xs mt-0.5">WordPress, Wix, Webflow &amp; more.</p>
          </div>
          <a href="/embed/guide" target="_blank" rel="noopener"
            className="flex-shrink-0 bg-slate-700 hover:bg-slate-800 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors">
            Guide →
          </a>
        </div>
      </div>
    </div>
  );
}
