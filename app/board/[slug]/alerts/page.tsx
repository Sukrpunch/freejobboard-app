'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function AlertsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/alerts/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ board_slug: slug, email }),
      });
      if (!res.ok) throw new Error();
      setState('success');
    } catch {
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center max-w-md">
          <div className="text-4xl mb-4">🔔</div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">You&apos;re subscribed!</h2>
          <p className="text-slate-500 text-sm">We&apos;ll email you whenever a new job is posted. You can unsubscribe anytime.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-10 max-w-md w-full">
        <div className="text-4xl mb-4">🔔</div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Get job alerts</h1>
        <p className="text-slate-500 text-sm mb-6">
          Be the first to know when new jobs are posted. We&apos;ll send you an email — no spam, ever.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <input
            required
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {state === 'error' && (
            <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
          )}
          <button
            type="submit"
            disabled={state === 'loading'}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-colors disabled:opacity-60"
          >
            {state === 'loading' ? 'Subscribing...' : 'Notify me of new jobs →'}
          </button>
        </form>
        <p className="text-xs text-slate-400 mt-4 text-center">Unsubscribe anytime. No spam.</p>
      </div>
    </div>
  );
}
