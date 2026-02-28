import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Clock, DollarSign, ArrowLeft, ExternalLink } from 'lucide-react';
import type { Board, Job } from '@/types';

export default async function JobDetailPage({
  params,
}: { params: Promise<{ slug: string; jobSlug: string }> }) {
  const { slug, jobSlug } = await params;
  const supabase = await createClient();

  const { data: board } = await supabase
    .from('boards').select('*').eq('slug', slug).single() as { data: Board | null };
  if (!board) notFound();

  const { data: job } = await supabase
    .from('jobs').select('*')
    .eq('board_id', board.id).eq('slug', jobSlug).eq('status', 'active').single() as { data: Job | null };
  if (!job) notFound();

  // Increment views
  await supabase.from('jobs').update({ views: (job.views ?? 0) + 1 }).eq('id', job.id);

  const color = board.primary_color || '#6366f1';
  const applyHref = job.apply_url || (job.apply_email ? `mailto:${job.apply_email}` : null);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-medium">
            <ArrowLeft size={16} /> {board.name}
          </Link>
          {applyHref && (
            <a href={applyHref} target="_blank" rel="noopener noreferrer"
              style={{ background: color }}
              className="text-white font-semibold text-sm px-5 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5">
              Apply Now <ExternalLink size={13} />
            </a>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start gap-4 mb-6">
              {job.company_logo_url ? (
                <img src={job.company_logo_url} alt={job.company} className="w-14 h-14 rounded-xl object-contain border border-slate-100" />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: color }}>{job.company[0]}</div>
              )}
              <div>
                <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
                <p className="text-slate-600 mt-0.5">{job.company}</p>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-sm text-slate-500"><MapPin size={13} />{job.location}{job.remote && ' · Remote'}</span>
                  <span className="flex items-center gap-1 text-sm text-slate-500"><Clock size={13} />{job.job_type.replace('-', ' ')}</span>
                  {(job.salary_min || job.salary_max) && (
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <DollarSign size={13} />
                      {job.salary_min && `$${(job.salary_min/1000).toFixed(0)}k`}{job.salary_max && `–$${(job.salary_max/1000).toFixed(0)}k`}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="prose prose-sm max-w-none text-slate-700"
              dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }} />
          </div>

          {job.requirements && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="font-semibold text-slate-900 mb-3">Requirements</h2>
              <div className="prose prose-sm max-w-none text-slate-700"
                dangerouslySetInnerHTML={{ __html: job.requirements.replace(/\n/g, '<br/>') }} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {applyHref && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 text-center">
              <a href={applyHref} target="_blank" rel="noopener noreferrer"
                style={{ background: color }}
                className="block w-full text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm">
                Apply Now →
              </a>
              <p className="text-xs text-slate-400 mt-2">Takes you to the application</p>
            </div>
          )}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 text-sm">Job Details</h3>
            <div className="text-sm text-slate-600 space-y-2">
              <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="capitalize">{job.job_type.replace('-',' ')}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Location</span><span>{job.location}</span></div>
              {job.remote && <div className="flex justify-between"><span className="text-slate-400">Remote</span><span>Yes</span></div>}
              {(job.salary_min || job.salary_max) && (
                <div className="flex justify-between"><span className="text-slate-400">Salary</span>
                  <span>{job.salary_min && `$${(job.salary_min/1000).toFixed(0)}k`}{job.salary_max && `–$${(job.salary_max/1000).toFixed(0)}k`}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
