'use client';

import { useState } from 'react';

export default function ApplyForm({
  jobId,
  color,
  boardId,
}: {
  jobId: string;
  color: string;
  boardId: string;
}) {
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [resume, setResume] = useState<File | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, name, email, cover_note: coverNote }),
      });
      if (!res.ok) throw new Error();

      // Upload resume if provided
      if (resume) {
        const form = new FormData();
        form.append('file', resume);
        form.append('board_id', boardId);
        form.append('candidate_name', name);
        await fetch('/api/resumes/upload', { method: 'POST', body: form }).catch(() => {});
      }

      setState('success');
    } catch {
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <div className="text-3xl mb-2">✅</div>
        <p className="font-semibold text-emerald-800">Application submitted!</p>
        <p className="text-sm text-emerald-600 mt-1">The employer will be in touch if there&apos;s a match.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
      <h3 className="font-semibold text-slate-900">Apply for this role</h3>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Full name *</label>
        <input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Jane Smith"
          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email address *</label>
        <input
          required
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="jane@example.com"
          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Cover note <span className="text-slate-400 font-normal">(optional)</span></label>
        <textarea
          value={coverNote}
          onChange={e => setCoverNote(e.target.value)}
          rows={4}
          placeholder="Tell us a bit about yourself and why you're a great fit..."
          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Resume <span className="text-slate-400 font-normal">(optional, PDF only)</span></label>
        <input
          type="file"
          accept=".pdf"
          onChange={e => setResume(e.target.files?.[0] || null)}
          className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {state === 'error' && (
        <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
      )}
      <button
        type="submit"
        disabled={state === 'loading'}
        style={{ background: color }}
        className="w-full text-white font-bold py-3 rounded-xl hover:opacity-90 transition-opacity text-sm disabled:opacity-60"
      >
        {state === 'loading' ? 'Submitting...' : 'Submit Application →'}
      </button>
    </form>
  );
}
