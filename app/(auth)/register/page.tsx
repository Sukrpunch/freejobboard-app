'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

async function createBoard(userId: string, slug: string, name: string) {
  const res = await fetch('/api/boards/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, slug, name }),
  });
  return res.ok;
}

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [boardName, setBoardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const toSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const slug = toSlug(boardName);
    if (!slug) { setError('Board name is invalid.'); setLoading(false); return; }

    // Sign up
    const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password });
    if (authErr || !authData.user) { setError(authErr?.message || 'Sign up failed.'); setLoading(false); return; }

    // Create board via API route (uses service role to bypass RLS)
    const ok = await createBoard(authData.user.id, slug, boardName);
    if (!ok) { setError('That board name is taken. Try another.'); setLoading(false); return; }

    router.push('/dashboard?welcome=1');
  }

  const INPUT = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent';

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-white">
            FreeJobBoard<span className="text-indigo-400">.ai</span>
          </Link>
          <p className="text-slate-400 mt-2 text-sm">Create your free job board in 60 seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Board Name</label>
            <input type="text" required value={boardName} onChange={e => setBoardName(e.target.value)}
              placeholder="e.g. Climate Tech Jobs" className={INPUT} />
            {boardName && (
              <p className="text-xs text-slate-500">Your board: <span className="text-indigo-400">{toSlug(boardName)}.freejobboard.ai</span></p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" className={INPUT} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <input type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min 8 characters" className={INPUT} />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors mt-2">
            {loading ? 'Creating your board…' : 'Create My Board — Free →'}
          </button>
        </form>

        <p className="text-center text-slate-500 text-sm mt-4">
          Already have a board? <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
