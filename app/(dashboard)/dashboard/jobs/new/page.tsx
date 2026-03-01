import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { postJob } from './actions';

export default async function PostJobPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: board } = await supabase.from('boards').select('id').eq('owner_id', user.id).single();
  if (!board) redirect('/register');

  const INPUT = 'w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white';
  const LABEL = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Post a Job</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in the details below. Your job will go live immediately.</p>
      </div>

      <form action={postJob} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <input type="hidden" name="board_id" value={board.id} />

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={LABEL}>Job Title *</label>
            <input type="text" name="title" required placeholder="e.g. Senior Software Engineer" className={INPUT} />
          </div>
          <div className="col-span-2">
            <label className={LABEL}>Company Name *</label>
            <input type="text" name="company" required placeholder="e.g. Acme Corp" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Location *</label>
            <input type="text" name="location" required placeholder="e.g. Austin, TX" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Job Type *</label>
            <select name="job_type" required className={INPUT}>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Salary Min (USD)</label>
            <input type="number" name="salary_min" placeholder="e.g. 100000" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Salary Max (USD)</label>
            <input type="number" name="salary_max" placeholder="e.g. 140000" className={INPUT} />
          </div>
        </div>

        <div>
          <label className={LABEL}>Job Description *</label>
          <textarea name="description" required rows={8} placeholder="Describe the role, responsibilities, team, and culture..." className={`${INPUT} resize-y`} />
        </div>

        <div>
          <label className={LABEL}>Requirements</label>
          <textarea name="requirements" rows={5} placeholder="Skills, experience, qualifications..." className={`${INPUT} resize-y`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL}>Apply URL</label>
            <input type="text" name="apply_url" placeholder="yoursite.com/careers/apply" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Or Apply Email</label>
            <input type="email" name="apply_email" placeholder="jobs@company.com" className={INPUT} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" name="remote" id="remote" value="true" className="rounded" />
          <label htmlFor="remote" className="text-sm text-slate-700">This is a remote position</label>
        </div>

        <button type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors">
          Post Job →
        </button>
      </form>
    </div>
  );
}
