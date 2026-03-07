import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

// CORS headers — allow any origin so the embed works on any website
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!slug) {
    return NextResponse.json({ error: 'Missing board slug' }, { status: 400, headers: CORS });
  }

  const supabase = await createServiceClient();

  // Get board by slug
  const { data: board, error: boardErr } = await supabase
    .from('boards')
    .select('id, name, slug, tagline, primary_color')
    .eq('slug', slug)
    .eq('approved', true)
    .single();

  if (boardErr || !board) {
    return NextResponse.json({ error: 'Board not found' }, { status: 404, headers: CORS });
  }

  // Get active jobs for this board
  const { data: jobs, error: jobsErr } = await supabase
    .from('jobs')
    .select('id, title, slug, company, location, job_type, salary_min, salary_max, salary_currency, remote, featured, apply_url, apply_email, created_at')
    .eq('board_id', board.id)
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50);

  if (jobsErr) {
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500, headers: CORS });
  }

  const payload = {
    board: {
      name: board.name,
      slug: board.slug,
      tagline: board.tagline,
      primaryColor: board.primary_color || '#6366f1',
      url: `https://${board.slug}.freejobboard.ai`,
    },
    jobs: (jobs || []).map(j => ({
      id: j.id,
      title: j.title,
      company: j.company,
      location: j.location,
      jobType: j.job_type,
      remote: j.remote,
      featured: j.featured,
      salary: j.salary_min && j.salary_max
        ? `${j.salary_currency === 'GBP' ? '£' : '$'}${j.salary_min.toLocaleString()}–${j.salary_currency === 'GBP' ? '£' : '$'}${j.salary_max.toLocaleString()}${j.job_type === 'full-time' ? '/yr' : ''}`
        : null,
      applyUrl: j.apply_url || j.apply_email ? `mailto:${j.apply_email}` : null,
      detailUrl: `https://${board.slug}.freejobboard.ai/jobs/${j.slug}`,
      postedAt: j.created_at,
    })),
  };

  return NextResponse.json(payload, { headers: CORS });
}
