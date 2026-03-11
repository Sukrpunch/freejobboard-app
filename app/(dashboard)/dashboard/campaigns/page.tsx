import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Mail, Megaphone, TrendingUp, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import SendCampaignForm from './SendCampaignForm';

export const metadata = { title: 'Campaigns — FreeJobBoard.ai' };

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: board } = await supabase
    .from('boards')
    .select('*')
    .eq('owner_id', user.id)
    .single();
  if (!board) redirect('/register');

  // Check if alert-campaigns app is installed and active
  const { data: campaignsApp } = await supabase
    .from('board_apps')
    .select('id')
    .eq('board_id', board.id)
    .eq('app_slug', 'alert-campaigns')
    .eq('active', true)
    .maybeSingle();

  // Get subscriber count
  const { count: subscriberCount } = await supabase
    .from('job_alerts')
    .select('*', { count: 'exact', head: true })
    .eq('board_id', board.id)
    .eq('confirmed', true);

  // Get active jobs
  const { data: activeJobs } = await supabase
    .from('jobs')
    .select('id, title, company')
    .eq('board_id', board.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Get subscriber list (max 50)
  const { data: subscribers } = await supabase
    .from('job_alerts')
    .select('email, keywords, created_at')
    .eq('board_id', board.id)
    .eq('confirmed', true)
    .order('created_at', { ascending: false })
    .limit(50);

  // Get campaign history (last 10)
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('id, subject, job_count, recipient_count, sent_at')
    .eq('board_id', board.id)
    .order('sent_at', { ascending: false })
    .limit(10);

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Alert Campaigns</h1>
          <p className="text-slate-500 text-sm mt-0.5">{board.name}</p>
        </div>
        <a
          href={`https://${board.slug}.freejobboard.ai`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          View Board <ExternalLink size={14} />
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
            <Mail size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{subscriberCount ?? 0}</p>
          <p className="text-sm text-slate-500 mt-0.5">Confirmed Subscribers</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp size={18} className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{activeJobs?.length ?? 0}</p>
          <p className="text-sm text-slate-500 mt-0.5">Active Jobs</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
            <Megaphone size={18} className="text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{campaigns?.length ?? 0}</p>
          <p className="text-sm text-slate-500 mt-0.5">Campaigns Sent</p>
        </div>
      </div>

      {/* Send Campaign Form — only if installed */}
      {campaignsApp ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h2 className="font-semibold text-slate-900 mb-6">Send a Campaign</h2>
          <SendCampaignForm
            boardId={board.id}
            boardName={board.name}
            activeJobs={activeJobs ?? []}
            subscriberCount={subscriberCount ?? 0}
          />
        </div>
      ) : (
        /* Upsell block */
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Zap size={20} className="text-indigo-600" fill="currentColor" />
            </div>
            <p className="font-semibold text-slate-800 mb-1">Unlock Alert Campaigns</p>
            <p className="text-sm text-slate-500 mb-4">
              Blast curated job digests to your entire subscriber list on demand. Perfect for
              announcing major opportunities or featured job highlights.
            </p>
            <a
              href="/dashboard/apps"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <Zap size={14} fill="white" /> Install Alert Campaigns — $29/mo
            </a>
          </div>
        </div>
      )}

      {/* Subscriber List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 mb-6">Confirmed Subscribers ({subscriberCount ?? 0})</h2>
        {!subscribers || subscribers.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">
            No confirmed subscribers yet. Share your board with people who are interested in your jobs!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Keywords</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Signup Date</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub) => (
                  <tr key={sub.email} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-900 font-medium break-all">{sub.email}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {sub.keywords ? (
                        <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
                          {sub.keywords}
                        </span>
                      ) : (
                        <span className="text-slate-400">All jobs</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500 text-xs">{formatDate(sub.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(subscriberCount ?? 0) > 50 && (
          <p className="text-xs text-slate-500 mt-4">
            Showing 50 of {subscriberCount} subscribers. Download full list in Settings.
          </p>
        )}
      </div>

      {/* Campaign History */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h2 className="font-semibold text-slate-900 mb-6">Campaign History</h2>
        {!campaigns || campaigns.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">
            No campaigns sent yet. Create and send your first campaign above!
          </p>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="flex items-center justify-between py-3 px-4 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 break-words">{campaign.subject}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {campaign.job_count} job{campaign.job_count !== 1 ? 's' : ''} to {campaign.recipient_count} subscriber
                    {campaign.recipient_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap ml-4">
                  <ArrowRight size={12} className="text-slate-300" />
                  {formatDate(campaign.sent_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
