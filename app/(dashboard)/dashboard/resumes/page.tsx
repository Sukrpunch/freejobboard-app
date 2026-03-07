'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Download, Search } from 'lucide-react';

export default function ResumesPage() {
  const [board, setBoard] = useState<{ id: string; name: string } | null>(null);
  const [resumes, setResumes] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const router = useRouter();
  const supabase = createClient();
  const LIMIT = 20;

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: b } = await supabase
        .from('boards')
        .select('id, name')
        .eq('owner_id', user.id)
        .single();

      if (!b) {
        router.push('/register');
        return;
      }

      // Check if Resume Database app is installed
      const { data: app } = await supabase
        .from('board_apps')
        .select('id')
        .eq('board_id', b.id)
        .eq('app_slug', 'resume-database')
        .eq('active', true)
        .single();

      if (!app) {
        // Redirect to apps page for upsell
        router.push('/dashboard/apps?upsell=resume-database');
        return;
      }

      setBoard(b);
      loadResumes(b.id, 0);
    };
    load();
  }, []);

  const loadResumes = async (bid: string, off: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/resumes/list?board_id=${bid}&search=${encodeURIComponent(search)}&limit=${LIMIT}&offset=${off}`);
      const json = await res.json();
      setResumes(json.resumes || []);
      setTotal(json.total || 0);
    } catch {
      setResumes([]);
      setTotal(0);
    }
    setOffset(off);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    if (board) loadResumes(board.id, 0);
  };

  const download = async (resumeId: string) => {
    const res = await fetch('/api/resumes/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_id: resumeId, board_id: board?.id }),
    });
    const { download_url } = await res.json();
    if (download_url) window.open(download_url, '_blank');
  };

  if (!board) return <div className="p-6 text-center text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resume Database</h1>
        <p className="text-slate-500 text-sm mt-1">{total} resumes from candidates</p>
      </div>

      {total === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <p className="text-4xl mb-3">📄</p>
          <p className="font-medium text-slate-600">No resumes yet</p>
          <p className="text-sm mt-1">Candidates will upload resumes when they apply to your jobs.</p>
        </div>
      ) : (
        <>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              Search
            </button>
          </form>

          <div className="bg-white border border-slate-200 rounded-2xl divide-y">
            {loading ? (
              <div className="p-6 text-center text-slate-400">Loading...</div>
            ) : resumes.length === 0 ? (
              <div className="p-6 text-center text-slate-400">No results found</div>
            ) : (
              resumes.map(r => (
                <div key={r.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{r.candidate_name}</p>
                    <a href={`mailto:${r.candidate_email}`} className="text-xs text-indigo-500 hover:underline">
                      {r.candidate_email}
                    </a>
                    <p className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => download(r.id)}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                  >
                    <Download size={12} /> Download
                  </button>
                </div>
              ))
            )}
          </div>

          {total > LIMIT && (
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => { if (board && offset > 0) loadResumes(board.id, offset - LIMIT); }}
                disabled={offset === 0}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                ← Previous
              </button>
              <span className="text-sm text-slate-500 self-center">
                {offset + 1}–{Math.min(offset + LIMIT, total)} of {total}
              </span>
              <button
                onClick={() => { if (board && offset + LIMIT < total) loadResumes(board.id, offset + LIMIT); }}
                disabled={offset + LIMIT >= total}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
