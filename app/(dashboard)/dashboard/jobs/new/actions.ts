'use server';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export async function postJob(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const title = formData.get('title') as string;
  const board_id = formData.get('board_id') as string;
  const company = formData.get('company') as string;
  const location = formData.get('location') as string;
  const job_type = formData.get('job_type') as string;
  const description = formData.get('description') as string;
  const requirements = formData.get('requirements') as string || null;
  const rawUrl = formData.get('apply_url') as string || null;
  const apply_url = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`) : null;
  const apply_email = formData.get('apply_email') as string || null;
  const salary_min = formData.get('salary_min') ? Number(formData.get('salary_min')) : null;
  const salary_max = formData.get('salary_max') ? Number(formData.get('salary_max')) : null;
  const remote = formData.get('remote') === 'true';

  // Generate unique slug
  const baseSlug = toSlug(`${title}-${company}`);
  const suffix = Date.now().toString(36);
  const slug = `${baseSlug}-${suffix}`;

  const { error } = await supabase.from('jobs').insert({
    board_id, title, slug, company, location, job_type, description,
    requirements, apply_url, apply_email, salary_min, salary_max, remote,
    status: 'active',
  });

  if (error) throw new Error(error.message);
  redirect('/dashboard/jobs');
}
