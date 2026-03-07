import { createServiceClient } from '@/lib/supabase/server';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explore Job Boards — FreeJobBoard.ai',
  description: 'Browse free niche job boards built on FreeJobBoard.ai. Find specialized roles in energy, events, tech, healthcare, and more.',
};

export const revalidate = 60;

export default async function BoardsPage() {
  const supabase = await createServiceClient();

  // Fetch all approved boards with active job counts
  const { data: boards } = await supabase
    .from('boards')
    .select('id, slug, name, tagline, primary_color, category, created_at')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  // Get job counts per board
  const boardIds = (boards || []).map(b => b.id);
  const { data: jobCounts } = await supabase
    .from('jobs')
    .select('board_id')
    .in('board_id', boardIds)
    .eq('status', 'active');

  const countMap: Record<string, number> = {};
  (jobCounts || []).forEach(j => {
    countMap[j.board_id] = (countMap[j.board_id] || 0) + 1;
  });

  const categories = Array.from(new Set((boards || []).map(b => b.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">Explore Job Boards</h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Free niche job boards built by industry experts. Find your next role in the right community.
          </p>
          <Link
            href="https://freejobboard.ai"
            className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Start your free board →
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Stats */}
        <div className="flex gap-6 mb-8 text-center justify-center">
          <div>
            <p className="text-2xl font-bold text-slate-900">{(boards || []).length}</p>
            <p className="text-sm text-slate-500">Active boards</p>
          </div>
          <div className="w-px bg-slate-200" />
          <div>
            <p className="text-2xl font-bold text-slate-900">{Object.values(countMap).reduce((a, b) => a + b, 0)}</p>
            <p className="text-sm text-slate-500">Open positions</p>
          </div>
          <div className="w-px bg-slate-200" />
          <div>
            <p className="text-2xl font-bold text-slate-900">Free</p>
            <p className="text-sm text-slate-500">Always</p>
          </div>
        </div>

        {/* Board grid */}
        {!boards || boards.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-lg">No boards yet — be the first!</p>
            <Link href="https://freejobboard.ai" className="text-indigo-500 hover:underline text-sm mt-2 inline-block">Create a free board →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {boards.map(board => {
              const count = countMap[board.id] || 0;
              const color = board.primary_color || '#6366f1';
              const initial = board.name.charAt(0).toUpperCase();
              return (
                <a
                  key={board.id}
                  href={`https://${board.slug}.freejobboard.ai`}
                  target="_blank"
                  rel="noopener"
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-md hover:border-slate-300 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                      style={{ background: color }}
                    >
                      {initial}
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                        {board.name}
                      </h2>
                      {board.category && (
                        <span className="text-xs text-slate-400 capitalize">{board.category}</span>
                      )}
                    </div>
                  </div>
                  {board.tagline && (
                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{board.tagline}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold ${count > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {count > 0 ? `${count} open position${count !== 1 ? 's' : ''}` : 'No open positions'}
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-indigo-500 transition-colors">View board →</span>
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center bg-white border border-slate-200 rounded-2xl p-8">
          <h2 className="font-bold text-slate-900 text-lg mb-2">Build your own niche job board</h2>
          <p className="text-slate-500 text-sm mb-4">Free forever. Launch in 60 seconds. No credit card required.</p>
          <Link
            href="https://app.freejobboard.ai/register"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors"
          >
            Get started free →
          </Link>
        </div>
      </div>
    </div>
  );
}
