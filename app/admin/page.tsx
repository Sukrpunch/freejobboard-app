import { createClient } from '@supabase/supabase-js';
import { createClient as createAuthClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Users, Briefcase, LayoutDashboard, ExternalLink } from 'lucide-react';

const ADMIN_EMAILS = ['sukrpunch@yahoo.com', 'chris@bessjobs.com', 'agenticmason@gmail.com'];

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminPage() {
  // Auth check
  const authClient = await createAuthClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email?.toLowerCase() ?? '')) {
    redirect('/login');
  }

  // Fetch data
  const [
    { data: boards, count: boardCount },
    { data: jobs, count: jobCount },
    { count: alertCount },
  ] = await Promise.all([
    serviceClient.from('boards').select('id, slug, name, category, created_at', { count: 'exact' })
      .order('created_at', { ascending: false }),
    serviceClient.from('jobs').select('id, title, company, board_id, status, created_at', { count: 'exact' })
      .order('created_at', { ascending: false }).limit(10),
    serviceClient.from('job_alerts').select('*', { count: 'exact', head: true }),
  ]);

  const STATS = [
    { label: 'Total Boards', value: boardCount ?? 0, icon: LayoutDashboard, color: 'text-indigo-400' },
    { label: 'Total Jobs', value: jobCount ?? 0, icon: Briefcase, color: 'text-emerald-400' },
    { label: 'Alert Subscribers', value: alertCount ?? 0, icon: Users, color: 'text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">FreeJobBoard.ai</p>
          <h1 className="text-2xl font-black tracking-tight">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Signed in as {user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {STATS.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-5">
              <Icon size={18} className={`${color} mb-3`} />
              <p className="text-3xl font-black">{value}</p>
              <p className="text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Boards */}
        <div className="bg-white/5 border border-white/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/8">
            <h2 className="font-bold text-slate-200">Boards ({boardCount ?? 0})</h2>
          </div>
          {boards && boards.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Board</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">Category</th>
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
                    <td className="px-3 py-3 text-sm text-slate-400">{board.category || '—'}</td>
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
          {jobs && jobs.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="text-left text-xs font-semibold text-slate-500 px-6 py-3">Job</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3">Posted</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
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
                    <td className="px-3 py-3 text-sm text-slate-500">
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
