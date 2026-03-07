import { createClient, createServiceClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import StatusSelect from './StatusSelect';

const COLUMNS = [
  { key: 'new',         label: 'New',        color: 'bg-blue-50 border-blue-200',     badge: 'bg-blue-100 text-blue-700' },
  { key: 'reviewed',    label: 'Reviewing',   color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700' },
  { key: 'shortlisted', label: 'Shortlisted', color: 'bg-indigo-50 border-indigo-200', badge: 'bg-indigo-100 text-indigo-700' },
  { key: 'rejected',    label: 'Rejected',    color: 'bg-red-50 border-red-200',       badge: 'bg-red-100 text-red-700' },
];

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default async function ApplicantsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: board } = await supabase.from('boards').select('id, name').eq('owner_id', user.id).single();
  if (!board) redirect('/register');

  const service = await createServiceClient();

  // Fetch all applications for jobs on this board, with job title
  const { data: applications } = await service
    .from('applications')
    .select('id, name, email, cover_note, status, created_at, job:jobs(title)')
    .in(
      'job_id',
      (await service.from('jobs').select('id').eq('board_id', board.id)).data?.map(j => j.id) ?? []
    )
    .order('created_at', { ascending: false });

  const grouped: Record<string, typeof applications> = {};
  COLUMNS.forEach(c => { grouped[c.key] = []; });
  (applications || []).forEach(a => {
    if (grouped[a.status]) grouped[a.status]!.push(a);
    else grouped['new']!.push(a);
  });

  const total = applications?.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Applicants</h1>
        <p className="text-slate-500 text-sm mt-1">
          {total === 0 ? 'No applications yet.' : `${total} total application${total !== 1 ? 's' : ''} across all your jobs.`}
        </p>
      </div>

      {total === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-medium text-slate-600">No applications yet</p>
          <p className="text-sm mt-1">Applications will appear here when candidates apply to your jobs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map(col => {
            const apps = grouped[col.key] || [];
            return (
              <div key={col.key} className={`border rounded-2xl p-4 ${col.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-slate-800 text-sm">{col.label}</h2>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
                    {apps.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {apps.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">None</p>
                  )}
                  {apps.map(app => (
                    <div key={app.id} className="bg-white border border-slate-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm leading-tight">{app.name}</p>
                          <a href={`mailto:${app.email}`} className="text-xs text-indigo-500 hover:underline">{app.email}</a>
                        </div>
                        <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(app.created_at)}</span>
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {(app.job as { title?: string } | null)?.title ?? 'Unknown role'}
                      </p>
                      {app.cover_note && (
                        <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 rounded-lg p-2">{app.cover_note}</p>
                      )}
                      <StatusSelect applicationId={app.id} current={app.status} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
