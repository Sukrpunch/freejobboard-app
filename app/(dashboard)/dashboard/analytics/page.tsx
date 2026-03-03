import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BarChart2, Briefcase, Users, TrendingUp, Star, ExternalLink, Zap } from 'lucide-react';

export const metadata = { title: 'Analytics — FreeJobBoard.ai' };

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: board } = await supabase
    .from('boards').select('*').eq('owner_id', user.id).single();
  if (!board) redirect('/register');

  // Job stats
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, company, status, featured, created_at')
    .eq('board_id', board.id)
    .order('created_at', { ascending: false });

  const allJobs    = jobs ?? [];
  const activeJobs = allJobs.filter(j => j.status === 'active');
  const featured   = allJobs.filter(j => j.featured);
  const draft      = allJobs.filter(j => j.status === 'draft');
  const expired    = allJobs.filter(j => j.status === 'expired');

  // Application stats
  const jobIds = allJobs.map(j => j.id);
  const { count: totalApps } = jobIds.length
    ? await supabase.from('applications').select('*', { count: 'exact', head: true }).in('job_id', jobIds)
    : { count: 0 };

  // Board app — Advanced Analytics installed?
  const { data: analyticsApp } = await supabase
    .from('board_apps')
    .select('id')
    .eq('board_id', board.id)
    .eq('app_id', 'advanced_analytics')
    .eq('status', 'active')
    .maybeSingle();

  // Jobs by week (last 8 weeks)
  const now = new Date();
  const weeks: { label: string; count: number }[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const count = allJobs.filter(j => {
      const d = new Date(j.created_at);
      return d >= weekStart && d <= weekEnd;
    }).length;
    weeks.push({ label, count });
  }

  const maxWeekCount = Math.max(...weeks.map(w => w.count), 1);

  const STATS = [
    { label: 'Total Jobs',    value: allJobs.length,    icon: Briefcase,  color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active',        value: activeJobs.length, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Applications',  value: totalApps ?? 0,    icon: Users,      color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Featured',      value: featured.length,   icon: Star,       color: 'text-amber-600',  bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">{board.name}</p>
        </div>
        <a
          href={`https://${board.slug}.freejobboard.ai`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View Board <ExternalLink size={14} />
        </a>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Jobs posted — weekly bar chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 mb-6">Jobs Posted — Last 8 Weeks</h2>
        {allJobs.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No jobs posted yet.</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {weeks.map((w, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-slate-500 font-medium">{w.count > 0 ? w.count : ''}</span>
                <div
                  className="w-full bg-indigo-100 rounded-t-md transition-all"
                  style={{ height: `${Math.max((w.count / maxWeekCount) * 96, w.count > 0 ? 8 : 2)}px`, backgroundColor: w.count > 0 ? '#6366f1' : '#e2e8f0' }}
                />
                <span className="text-[10px] text-slate-400 text-center leading-tight">{w.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Job status breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',  count: activeJobs.length, color: 'bg-emerald-500' },
          { label: 'Draft',   count: draft.length,      color: 'bg-slate-400' },
          { label: 'Expired', count: expired.length,    color: 'bg-red-400' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-sm text-slate-500">{label}</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{count}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {allJobs.length > 0 ? `${Math.round(count / allJobs.length * 100)}% of total` : '—'}
            </p>
          </div>
        ))}
      </div>

      {/* Traffic Analytics — Plausible */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-slate-600" />
            <h2 className="font-semibold text-slate-900">Traffic Analytics</h2>
          </div>
          {analyticsApp ? (
            <a
              href="https://plausible.io/freejobboard.ai"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Open Plausible <ExternalLink size={12} />
            </a>
          ) : null}
        </div>

        {analyticsApp ? (
          <iframe
            src={`https://plausible.io/share/${board.slug}.freejobboard.ai?auth=auto&embed=true&theme=light`}
            scrolling="no"
            frameBorder="0"
            loading="lazy"
            className="w-full rounded-xl border border-slate-100"
            style={{ height: 380 }}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Zap size={20} className="text-indigo-600" fill="currentColor" />
            </div>
            <p className="font-semibold text-slate-800 mb-1">Unlock Advanced Analytics</p>
            <p className="text-sm text-slate-500 mb-4">
              Get page views, visitor counts, top referrers, and job click-throughs — powered by Plausible.
            </p>
            <a
              href="/dashboard/apps"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Zap size={14} fill="white" /> Install Advanced Analytics — $19/mo
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
