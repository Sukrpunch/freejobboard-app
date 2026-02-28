import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Briefcase, Users, Eye, PlusCircle, Zap } from 'lucide-react';

export default async function DashboardPage({
  searchParams,
}: { searchParams: Promise<{ welcome?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const sp = await searchParams;

  const { data: board } = await supabase
    .from('boards').select('*').eq('owner_id', user.id).single();
  if (!board) redirect('/register');

  const [{ count: totalJobs }, { count: activeJobs }, { count: totalApps }] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('board_id', board.id),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('board_id', board.id).eq('status', 'active'),
    supabase.from('applications').select('*', { count: 'exact', head: true })
      .in('job_id', (await supabase.from('jobs').select('id').eq('board_id', board.id)).data?.map(j => j.id) ?? []),
  ]);

  const { data: recentJobs } = await supabase
    .from('jobs').select('*').eq('board_id', board.id)
    .order('created_at', { ascending: false }).limit(5);

  const STATS = [
    { label: 'Total Jobs', value: totalJobs ?? 0, icon: Briefcase, color: 'text-indigo-600' },
    { label: 'Active Now', value: activeJobs ?? 0, icon: Eye, color: 'text-emerald-600' },
    { label: 'Applications', value: totalApps ?? 0, icon: Users, color: 'text-purple-600' },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      {sp.welcome && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-start gap-3">
          <Zap size={20} className="text-indigo-600 mt-0.5 shrink-0" fill="currentColor" />
          <div>
            <p className="font-semibold text-indigo-900">Your board is live! 🎉</p>
            <p className="text-sm text-indigo-700 mt-0.5">
              Visit <a href={`https://${board.slug}.freejobboard.ai`} target="_blank" rel="noopener noreferrer"
                className="underline font-medium">{board.slug}.freejobboard.ai</a> — then post your first job.
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{board.name}</h1>
          <p className="text-slate-500 text-sm mt-0.5">{board.slug}.freejobboard.ai</p>
        </div>
        <Link href="/dashboard/jobs/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
          <PlusCircle size={16} /> Post a Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {STATS.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5">
            <Icon size={20} className={`${color} mb-3`} />
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent jobs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Recent Jobs</h2>
          <Link href="/dashboard/jobs" className="text-sm text-indigo-600 hover:text-indigo-700">View all →</Link>
        </div>
        {recentJobs && recentJobs.length > 0 ? (
          <div className="space-y-3">
            {recentJobs.map(job => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <div>
                  <p className="font-medium text-slate-900 text-sm">{job.title}</p>
                  <p className="text-xs text-slate-500">{job.company} · {job.location}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  job.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                  job.status === 'draft' ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-600'
                }`}>{job.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm mb-3">No jobs yet</p>
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
