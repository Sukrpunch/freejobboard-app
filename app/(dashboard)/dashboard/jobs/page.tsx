import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { PlusCircle, ExternalLink, Star } from 'lucide-react';
import { FeatureToggle } from './FeatureToggle';

export default async function JobsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: board } = await supabase.from('boards').select('*').eq('owner_id', user.id).single();
  if (!board) redirect('/register');

  const [{ data: jobs }, { data: featuredApp }] = await Promise.all([
    supabase.from('jobs').select('*').eq('board_id', board.id).order('created_at', { ascending: false }),
    supabase.from('board_apps').select('id').eq('board_id', board.id).eq('app_slug', 'featured-listings').eq('active', true).single(),
  ]);

  const hasFeaturedApp = !!featuredApp;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
          {hasFeaturedApp && (
            <p className="text-xs text-indigo-500 font-medium mt-0.5 flex items-center gap-1">
              <Star size={11} fill="currentColor" /> Featured Listings active — toggle ⭐ to pin jobs to top
            </p>
          )}
        </div>
        <Link href="/dashboard/jobs/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <PlusCircle size={15} /> Post a Job
        </Link>
      </div>

      {!hasFeaturedApp && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <Star size={14} className="text-amber-500" />
            <span><strong>Featured Listings</strong> — pin jobs to the top of your board for $29/mo</span>
          </div>
          <Link href="/dashboard/apps" className="text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2">
            Install →
          </Link>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {jobs && jobs.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Job</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">Type</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">Views</th>
                {hasFeaturedApp && (
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3">Featured</th>
                )}
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 ${job.featured ? 'bg-amber-50/40' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {job.featured && <Star size={12} className="text-amber-400 flex-shrink-0" fill="currentColor" />}
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{job.title}</p>
                        <p className="text-xs text-slate-500">{job.company} · {job.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-600 capitalize">{job.job_type.replace('-', ' ')}</td>
                  <td className="px-3 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      job.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      job.status === 'draft' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-600'
                    }`}>{job.status}</span>
                  </td>
                  <td className="px-3 py-4 text-sm text-slate-600">{job.views}</td>
                  {hasFeaturedApp && (
                    <td className="px-3 py-4 text-center">
                      <FeatureToggle jobId={job.id} featured={job.featured} />
                    </td>
                  )}
                  <td className="px-5 py-4 text-right">
                    <a href={`https://${board.slug}.freejobboard.ai/jobs/${job.slug}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1 text-xs font-medium">
                      View <ExternalLink size={11} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 mb-4">No jobs posted yet</p>
            <Link href="/dashboard/jobs/new"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
              <PlusCircle size={15} /> Post your first job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
