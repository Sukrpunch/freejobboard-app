import { createClient } from '@supabase/supabase-js';
import { createClient as createAuthClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Users, Briefcase, LayoutDashboard, ExternalLink, DollarSign, AppWindow, TrendingUp, ArrowLeft } from 'lucide-react';
import { AVAILABLE_APPS } from '@/types';

const ADMIN_EMAILS = ['sukrpunch@yahoo.com', 'chris@bessjobs.com', 'agenticmason@gmail.com'];

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split('T')[0];
  });
}

export default async function AdminPage() {
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) redirect('/login');

  const [
    { data: boards, count: boardCount },
    { data: allJobs,  count: jobCount },
    { count: alertCount },
    { data: boardApps },
    { count: appCount },
    { data: recentJobs },
  ] = await Promise.all([
    serviceClient.from('boards').select('id, slug, name, category, created_at', { count: 'exact' })
      .order('created_at', { ascending: false }),
    serviceClient.from('jobs').select('id, created_at', { count: 'exact' }),
    serviceClient.from('job_alerts').select('*', { count: 'exact', head: true }),
    serviceClient.from('board_apps').select('app_id, status, created_at').eq('status', 'active'),
    serviceClient.from('board_apps').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    serviceClient.from('jobs').select('id, title, company, status, created_at')
      .order('created_at', { ascending: false }).limit(10),
  ]);

  // MRR
  const appPriceMap = Object.fromEntries(AVAILABLE_APPS.map(a => [a.slug, a.price_monthly]));
  const mrr = (boardApps ?? []).reduce((sum, a) => sum + (appPriceMap[a.app_id] ?? 0), 0);

  // Per-app install counts
  const appInstallCounts: Record<string, number> = {};
  for (const a of boardApps ?? []) {
    appInstallCounts[a.app_id] = (appInstallCounts[a.app_id] ?? 0) + 1;
  }

  // Growth charts — last 30 days
  const days = getLast30Days();

  const boardsByDay = days.map(day => ({
    label: day.slice(5), // MM-DD
    count: (boards ?? []).filter(b => b.created_at.startsWith(day)).length,
  }));

  const jobsByDay = days.map(day => ({
    label: day.slice(5),
    count: (allJobs ?? []).filter(j => j.created_at.startsWith(day)).length,
  }));

  const maxBoards = Math.max(...boardsByDay.map(d => d.count), 1);
  const maxJobs   = Math.max(...jobsByDay.map(d => d.count), 1);

  // Cumulative totals for sparkline
  let cumBoards = 0;
  const cumulativeBoards = boardsByDay.map(d => { cumBoards += d.count; return cumBoards; });
  const maxCum = Math.max(...cumulativeBoards, 1);

  const STATS = [
    { label: 'Total Boards',    value: boardCount ?? 0, icon: LayoutDashboard, color: 'text-indigo-400',  bg: 'bg-indigo-500/10', sub: 'registered' },
    { label: 'Total Jobs',      value: jobCount ?? 0,   icon: Briefcase,       color: 'text-emerald-400', bg: 'bg-emerald-500/10', sub: 'across all boards' },
    { label: 'Alert Subs',      value: alertCount ?? 0, icon: Users,           color: 'text-purple-400',  bg: 'bg-purple-500/10', sub: 'job alert signups' },
    { label: 'App Installs',    value: appCount ?? 0,   icon: AppWindow,       color: 'text-sky-400',     bg: 'bg-sky-500/10',    sub: 'active paid apps' },
    { label: 'MRR',             value: `$${mrr}`,       icon: DollarSign,      color: 'text-amber-400',   bg: 'bg-amber-500/10',  sub: 'monthly recurring' },
    { label: 'ARR (proj.)',     value: `$${mrr * 12}`,  icon: TrendingUp,      color: 'text-rose-400',    bg: 'bg-rose-500/10',   sub: 'annualized' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">FreeJobBoard.ai</p>
            <h1 className="text-2xl font-black tracking-tight">Platform Analytics</h1>
            <p className="text-slate-500 text-sm mt-1">Full ecosystem view · {user.email}</p>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {STATS.map(({ label, value, icon: Icon, color, bg, sub }) => (
            <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon size={18} className={color} />
              </div>
              <p className="text-3xl font-black">{value}</p>
              <p className="text-sm text-slate-300 mt-0.5">{label}</p>
              <p className="text-xs text-slate-600 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* Growth Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Boards created — last 30 days */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
            <h2 className="font-bold text-slate-200 mb-1">New Boards — Last 30 Days</h2>
            <p className="text-xs text-slate-500 mb-5">{boardCount} total · {cumulativeBoards[cumulativeBoards.length - 1]} active</p>
            <div className="flex items-end gap-1 h-24">
              {boardsByDay.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: `${Math.max((d.count / maxBoards) * 88, d.count > 0 ? 6 : 2)}px`,
                      backgroundColor: d.count > 0 ? '#6366f1' : '#1e293b',
                    }}
                    title={`${d.label}: ${d.count} boards`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-slate-600">{boardsByDay[0].label}</span>
              <span className="text-[10px] text-slate-600">{boardsByDay[boardsByDay.length - 1].label}</span>
            </div>
          </div>

          {/* Jobs posted — last 30 days */}
          <div className="bg-white/5 border border-white/8 rounded-2xl p-6">
            <h2 className="font-bold text-slate-200 mb-1">Jobs Posted — Last 30 Days</h2>
            <p className="text-xs text-slate-500 mb-5">{jobCount} total across all boards</p>
            <div className="flex items-end gap-1 h-24">
              {jobsByDay.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-sm transition-all"
                    style={{
                      height: `${Math.max((d.count / maxJobs) * 88, d.count > 0 ? 6 : 2)}px`,
                      backgroundColor: d.count > 0 ? '#10b981' : '#1e293b',
                    }}
                    title={`${d.label}: ${d.count} jobs`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[10px] text-slate-600">{jobsByDay[0].label}</span>
              <span className="text-[10px] text-slate-600">{jobsByDay[jobsByDay.length - 1].label}</span>
            </div>
          </div>
        </div>

        {/* App Revenue Breakdown */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
            <h2 className="font-bold text-slate-200">App Revenue Breakdown</h2>
            <span className="text-xs text-slate-500">MRR: <span className="text-amber-400 font-bold">${mrr}/mo</span></span>
          </div>
          <div className="divide-y divide-white/5">
            {AVAILABLE_APPS.map(app => {
              const installs = appInstallCounts[app.slug] ?? 0;
              const revenue  = installs * app.price_monthly;
              return (
                <div key={app.slug} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{app.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{app.name}</p>
                      <p className="text-xs text-slate-500">${app.price_monthly}/mo per board</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">${revenue}/mo</p>
                    <p className="text-xs text-slate-500">{installs} install{installs !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-6 py-4 border-t border-white/8 flex justify-between items-center bg-white/3">
            <span className="text-sm font-semibold text-slate-400">Total MRR</span>
            <span className="text-lg font-black text-amber-400">${mrr}/mo</span>
          </div>
        </div>

        {/* All Boards */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8">
            <h2 className="font-bold text-slate-200">All Boards ({boardCount ?? 0})</h2>
          </div>
          {boards && boards.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Board</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden md:table-cell">Category</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">Created</th>
                  <th className="text-right text-xs font-semibold text-slate-500 px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {boards.map(board => (
                  <tr key={board.id} className="border-b border-white/5 last:border-0 hover:bg-white/3">
                    <td className="px-6 py-3">
                      <p className="font-semibold text-sm text-slate-200">{board.name}</p>
                      <p className="text-xs text-slate-500">{board.slug}.freejobboard.ai</p>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-400 hidden md:table-cell">{board.category || '—'}</td>
                    <td className="px-3 py-3 text-sm text-slate-500">
                      {new Date(board.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <a href={`https://${board.slug}.freejobboard.ai`} target="_blank" rel="noopener noreferrer"
                        className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 text-xs">
                        View <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">No boards yet.</div>
          )}
        </div>

        {/* Recent Jobs */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8">
            <h2 className="font-bold text-slate-200">Recent Jobs ({jobCount ?? 0} total)</h2>
          </div>
          {recentJobs && recentJobs.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Job</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden md:table-cell">Posted</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map(job => (
                  <tr key={job.id} className="border-b border-white/5 last:border-0 hover:bg-white/3">
                    <td className="px-6 py-3">
                      <p className="font-semibold text-sm text-slate-200">{job.title}</p>
                      <p className="text-xs text-slate-500">{job.company}</p>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        job.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                      }`}>{job.status}</span>
                    </td>
                    <td className="px-3 py-3 text-sm text-slate-500 hidden md:table-cell">
                      {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">No jobs yet.</div>
          )}
        </div>

      </div>
    </div>
  );
}
