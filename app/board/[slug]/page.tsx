import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, DollarSign, Search, Zap, ArrowRight, Briefcase } from 'lucide-react';
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
  const featured = jobs?.filter(j => j.featured) ?? [];
  const regular = jobs?.filter(j => !j.featured) ?? [];

  const JOB_TYPE_COLORS: Record<string, string> = {
    'full-time': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'part-time': 'bg-blue-50 text-blue-700 border-blue-100',
    'contract': 'bg-violet-50 text-violet-700 border-violet-100',
    'freelance': 'bg-amber-50 text-amber-700 border-amber-100',
    'internship': 'bg-pink-50 text-pink-700 border-pink-100',
  };

  return (
    <div className="min-h-screen" style={{ background: '#f8f9fc' }}>

      {/* Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {board.logo_url ? (
              <img src={board.logo_url} alt={board.name} className="h-9 w-9 rounded-xl object-contain border border-slate-100" />
            ) : (
              <div className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-sm"
                style={{ background: color }}>{board.name[0]}</div>
            )}
            <div>
              <h1 className="font-bold text-slate-900 text-base leading-tight">{board.name}</h1>
              {board.tagline && <p className="text-xs text-slate-400 leading-tight">{board.tagline}</p>}
            </div>
          </div>
          <Link href="/post-a-job"
            style={{ background: color }}
            className="text-white font-semibold text-sm px-4 py-2 rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center gap-1.5">
            Post a Job <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero search */}
      <div className="pt-10 pb-8 px-5" style={{ background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)` }}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border"
            style={{ color, borderColor: `${color}30`, background: `${color}08` }}>
            <Briefcase size={12} /> {jobs?.length ?? 0} open positions
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Find your next opportunity</h2>
          {board.tagline && <p className="text-slate-500 mb-6 text-sm">{board.tagline}</p>}

          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs, companies, keywords…"
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-shadow"
              style={{ '--tw-ring-color': color } as React.CSSProperties}
            />
          </div>
        </div>
      </div>

      {/* Jobs */}
      <main className="max-w-5xl mx-auto px-5 pb-16">

        {/* Featured */}
        {featured.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={14} className="text-amber-500" fill="currentColor" />
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Featured</span>
            </div>
            <div className="space-y-3">
              {featured.map(job => <JobCard key={job.id} job={job} color={color} typeColors={JOB_TYPE_COLORS} featured />)}
            </div>
          </div>
        )}

        {/* All jobs */}
        {regular.length > 0 ? (
          <div className="space-y-3">
            {featured.length > 0 && (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">All Jobs</p>
            )}
            {regular.map(job => <JobCard key={job.id} job={job} color={color} typeColors={JOB_TYPE_COLORS} />)}
          </div>
        ) : jobs?.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl"
              style={{ background: `${color}10` }}>💼</div>
            <h3 className="font-bold text-slate-900 mb-2">No jobs posted yet</h3>
            <p className="text-slate-500 text-sm mb-5">Be the first to post a position on this board.</p>
            <Link href="/post-a-job"
              style={{ background: color }}
              className="inline-flex items-center gap-2 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">
              Post a Job <ArrowRight size={14} />
            </Link>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function JobCard({ job, color, typeColors, featured = false }: {
  job: Job; color: string; typeColors: Record<string, string>; featured?: boolean;
}) {
  return (
    <Link href={`/jobs/${job.slug}`}
      className={`group flex items-center justify-between gap-4 bg-white border rounded-2xl p-4 hover:shadow-md transition-all duration-200 ${
        featured ? 'border-amber-200 shadow-sm' : 'border-slate-100 hover:border-slate-200'
      }`}>
      <div className="flex items-center gap-4 min-w-0">
        {job.company_logo_url ? (
          <img src={job.company_logo_url} alt={job.company}
            className="w-12 h-12 rounded-xl object-contain border border-slate-100 flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-sm"
            style={{ background: color }}>{job.company[0]}</div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h2 className="font-bold text-slate-900 text-sm group-hover:text-[var(--accent)] transition-colors truncate"
              style={{ '--accent': color } as React.CSSProperties}>{job.title}</h2>
          </div>
          <p className="text-sm text-slate-500 mb-1.5">{job.company}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <MapPin size={10} />{job.location}{job.remote && ' · Remote'}
            </span>
            {(job.salary_min || job.salary_max) && (
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <DollarSign size={10} />
                {job.salary_min && `$${(job.salary_min / 1000).toFixed(0)}k`}
                {job.salary_max && `–$${(job.salary_max / 1000).toFixed(0)}k`}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${typeColors[job.job_type] || 'bg-slate-50 text-slate-600 border-slate-100'}`}>
          {job.job_type.replace('-', ' ')}
        </span>
        <ArrowRight size={14} className="text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
