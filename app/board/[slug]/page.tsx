import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, DollarSign, Search } from 'lucide-react';
import type { Board, Job } from '@/types';

export default async function BoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: board } = await supabase
    .from('boards').select('*').eq('slug', slug).eq('approved', true).single() as { data: Board | null };
  if (!board) notFound();

  const { data: jobs } = await supabase
    .from('jobs').select('*')
    .eq('board_id', board.id).eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false }) as { data: Job[] | null };

  const color = board.primary_color || '#6366f1';

  return (
    <div className="min-h-screen bg-white">
      {/* Board Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {board.logo_url && (
              <img src={board.logo_url} alt={board.name} className="h-8 w-8 rounded-lg object-contain" />
            )}
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight">{board.name}</h1>
              {board.tagline && <p className="text-xs text-slate-500">{board.tagline}</p>}
            </div>
          </div>
          <Link href="/post-a-job"
            style={{ background: color }}
            className="text-white font-semibold text-sm px-4 py-2 rounded-lg transition-opacity hover:opacity-90">
            Post a Job
          </Link>
        </div>
      </header>

      {/* Search bar */}
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': color } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* Job listings */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <p className="text-sm text-slate-500 mb-4">{jobs?.length ?? 0} open positions</p>
        <div className="space-y-3">
          {jobs && jobs.length > 0 ? jobs.map(job => (
            <Link key={job.id} href={`/jobs/${job.slug}`}
              className={`block bg-white border rounded-xl p-4 hover:shadow-md transition-shadow ${job.featured ? 'border-yellow-300 bg-yellow-50/30' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  {job.company_logo_url ? (
                    <img src={job.company_logo_url} alt={job.company} className="w-10 h-10 rounded-lg object-contain flex-shrink-0 border border-slate-100" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-sm"
                      style={{ background: color }}>{job.company[0]}</div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-semibold text-slate-900">{job.title}</h2>
                      {job.featured && <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">Featured</span>}
                    </div>
                    <p className="text-sm text-slate-600 mt-0.5">{job.company}</p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={11} />{job.location}{job.remote && ' · Remote'}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock size={11} />{job.job_type.replace('-', ' ')}
                      </span>
                      {(job.salary_min || job.salary_max) && (
                        <span className="flex items-center gap-1 text-xs text-slate-500">
                          <DollarSign size={11} />
                          {job.salary_min && `$${(job.salary_min / 1000).toFixed(0)}k`}
                          {job.salary_max && `–$${(job.salary_max / 1000).toFixed(0)}k`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          )) : (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg font-medium mb-2">No jobs posted yet</p>
              <p className="text-sm">Be the first to <Link href="/post-a-job" className="underline">post a job</Link></p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 mt-12 py-4 text-center text-xs text-slate-400">
        Powered by <a href="https://freejobboard.ai" className="hover:text-slate-600 underline">FreeJobBoard.ai</a>
      </footer>
    </div>
  );
}
