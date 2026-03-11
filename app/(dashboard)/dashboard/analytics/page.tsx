import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BarChart2, Briefcase, Users, TrendingUp, Star, ExternalLink, Zap, ArrowRight } from 'lucide-react';

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
    .select('id, title, company, status, featured, created_at, views')
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

  // Board app — Advanced Analytics installed? [BUG FIX: use app_slug not app_id]
  const { data: analyticsApp } = await supabase
    .from('board_apps')
    .select('id')
    .eq('board_id', board.id)
    .eq('app_slug', 'advanced-analytics')
    .eq('active', true)
    .maybeSingle();

  // Jobs by week (last 8 weeks) for free tier
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

  // PAID TIER: Top performing jobs (views > 0)
  let topJobs: any[] = [];
  if (analyticsApp && allJobs.length > 0) {
    const jobsWithViews = allJobs.filter((j: any) => j.views && j.views > 0).sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 10);
    
    // Get application counts for these jobs
    const topJobIds = jobsWithViews.map(j => j.id);
    if (topJobIds.length > 0) {
      const { data: appsByJob } = await supabase
        .from('applications')
        .select('job_id')
        .in('job_id', topJobIds);
      
      const appCountByJobId: Record<string, number> = {};
      (appsByJob ?? []).forEach(app => {
        appCountByJobId[app.job_id] = (appCountByJobId[app.job_id] || 0) + 1;
      });

      topJobs = jobsWithViews.map(j => ({
        ...j,
        appCount: appCountByJobId[j.id] || 0,
        conversionRate: j.views ? ((appCountByJobId[j.id] || 0) / j.views * 100).toFixed(1) : '0',
      }));
    }
  }

  // PAID TIER: Applications by week (last 8 weeks)
  let appWeeks: { label: string; count: number }[] = [];
  if (analyticsApp) {
    appWeeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const label = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const { data: weekApps } = jobIds.length
        ? await supabase
            .from('applications')
            .select('created_at')
            .in('job_id', jobIds)
            .gte('created_at', weekStart.toISOString())
            .lte('created_at', weekEnd.toISOString())
        : { data: [] };
      
      appWeeks.push({ label, count: weekApps?.length ?? 0 });
    }
  }

  const maxAppWeekCount = analyticsApp ? Math.max(...appWeeks.map(w => w.count), 1) : 1;

  // PAID TIER: Total views for conversion funnel
  const totalViews = allJobs.reduce((sum, j: any) => sum + (j.views || 0), 0);
  const conversionRate = totalViews > 0 ? ((totalApps ?? 0) / totalViews * 100).toFixed(1) : '0';

  // PAID TIER: Recent applications (last 10)
  let recentApps: any[] = [];
  if (analyticsApp && jobIds.length > 0) {
    const { data: apps } = await supabase
      .from('applications')
      .select('id, name, job_id, created_at')
      .in('job_id', jobIds)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (apps && apps.length > 0) {
      // Get job titles for each app
      const jobsMap = new Map(allJobs.map(j => [j.id, j.title]));
      recentApps = apps.map(app => ({
        ...app,
        jobTitle: jobsMap.get(app.job_id) || 'Unknown Job',
        timeAgo: formatTimeAgo(new Date(app.created_at)),
      }));
    }
  }

  function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }

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

      {/* Stats grid — FREE TIER */}
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

      {/* Jobs posted — weekly bar chart — FREE TIER */}
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

      {/* Job status breakdown — FREE TIER */}
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

      {/* PAID TIER: Advanced Analytics */}
      {analyticsApp ? (
        <>
          {/* Conversion Funnel Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                <BarChart2 size={18} className="text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{totalViews.toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-0.5">Total Views</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
                <Users size={18} className="text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{(totalApps ?? 0).toLocaleString()}</p>
              <p className="text-sm text-slate-500 mt-0.5">Total Applications</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mb-3">
                <TrendingUp size={18} className="text-green-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{conversionRate}%</p>
              <p className="text-sm text-slate-500 mt-0.5">Conversion Rate</p>
            </div>
          </div>

          {/* Applications Over Time */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-semibold text-slate-900 mb-6">Applications Over Time — Last 8 Weeks</h2>
            {appWeeks.length === 0 || appWeeks.every(w => w.count === 0) ? (
              <p className="text-slate-400 text-sm text-center py-6">No applications yet.</p>
            ) : (
              <div className="flex items-end gap-2 h-32">
                {appWeeks.map((w, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500 font-medium">{w.count > 0 ? w.count : ''}</span>
                    <div
                      className="w-full bg-purple-100 rounded-t-md transition-all"
                      style={{ height: `${Math.max((w.count / maxAppWeekCount) * 96, w.count > 0 ? 8 : 2)}px`, backgroundColor: w.count > 0 ? '#a855f7' : '#e2e8f0' }}
                    />
                    <span className="text-[10px] text-slate-400 text-center leading-tight">{w.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Performing Jobs Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-semibold text-slate-900 mb-6">Top Performing Jobs</h2>
            {topJobs.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No jobs with views yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Job Title</th>
                      <th className="text-left py-3 px-3 font-semibold text-slate-700">Company</th>
                      <th className="text-right py-3 px-3 font-semibold text-slate-700">Views</th>
                      <th className="text-right py-3 px-3 font-semibold text-slate-700">Apps</th>
                      <th className="text-right py-3 px-3 font-semibold text-slate-700">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topJobs.map((job) => (
                      <tr key={job.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 font-medium">{job.title}</span>
                            {job.featured && <span className="text-amber-500">⭐</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{job.company || '—'}</td>
                        <td className="py-3 px-3 text-right text-slate-900 font-medium">{(job.views || 0).toLocaleString()}</td>
                        <td className="py-3 px-3 text-right text-slate-900 font-medium">{job.appCount}</td>
                        <td className="py-3 px-3 text-right text-slate-900 font-medium">{job.conversionRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Applications Feed */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-semibold text-slate-900 mb-6">Recent Applications</h2>
            {recentApps.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No applications yet.</p>
            ) : (
              <div className="space-y-4">
                {recentApps.map((app) => (
                  <div key={app.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{app.name}</p>
                      <p className="text-sm text-slate-500">{app.jobTitle}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 whitespace-nowrap">
                      <ArrowRight size={12} className="text-slate-300" />
                      {app.timeAgo}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* UPSELL: Advanced Analytics */
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart2 size={18} className="text-slate-600" />
              <h2 className="font-semibold text-slate-900">Advanced Analytics</h2>
            </div>
          </div>
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Zap size={20} className="text-indigo-600" fill="currentColor" />
            </div>
            <p className="font-semibold text-slate-800 mb-1">Unlock Advanced Analytics</p>
            <p className="text-sm text-slate-500 mb-4">
              Get detailed job performance metrics, application trends, conversion funnels, and real-time activity feeds to optimize your job board.
            </p>
            <a
              href="/dashboard/apps"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Zap size={14} fill="white" /> Install Advanced Analytics — $19/mo
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
