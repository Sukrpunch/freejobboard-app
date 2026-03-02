import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function Image({
  params,
}: {
  params: { slug: string; jobSlug: string };
}) {
  const { slug, jobSlug } = params;

  const { data: board } = await serviceClient
    .from('boards').select('name, primary_color').eq('slug', slug).single();

  const { data: job } = await serviceClient
    .from('jobs').select('title, company, location, remote, job_type, salary_min, salary_max')
    .eq('slug', jobSlug).single();

  const boardName = board?.name ?? 'Job Board';
  const color = board?.primary_color ?? '#6366f1';
  const jobTitle = job?.title ?? 'Open Position';
  const company = job?.company ?? '';
  const location = job?.location ?? '';
  const remote = job?.remote ?? false;
  const jobType = job?.job_type?.replace(/-/g, ' ') ?? '';
  const salaryMin = job?.salary_min;
  const salaryMax = job?.salary_max;

  const salary = salaryMin || salaryMax
    ? `$${salaryMin ? `${Math.round(salaryMin / 1000)}k` : ''}${salaryMax ? `–$${Math.round(salaryMax / 1000)}k` : ''}`
    : null;

  const locationStr = [location, remote ? 'Remote' : null].filter(Boolean).join(' · ');

  // Derive a lighter tint of the board color for the bg
  const bgColor = '#0f0f18';

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: bgColor,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: color }} />

        {/* Board name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16, fontWeight: 800,
          }}>
            {boardName[0]}
          </div>
          <span style={{ color: '#94a3b8', fontSize: 18, fontWeight: 600 }}>{boardName}</span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Company */}
          {company && (
            <div style={{
              display: 'flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 100,
              padding: '8px 18px',
              width: 'fit-content',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 13, fontWeight: 800, marginRight: 10,
              }}>
                {company[0]}
              </div>
              <span style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600 }}>{company}</span>
            </div>
          )}

          {/* Job title */}
          <div style={{
            fontSize: jobTitle.length > 40 ? 52 : 64,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1.1,
            letterSpacing: '-1.5px',
          }}>
            {jobTitle}
          </div>

          {/* Meta chips */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
            {locationStr && (
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 100, padding: '8px 18px',
                color: '#cbd5e1', fontSize: 16, fontWeight: 500,
              }}>
                📍 {locationStr}
              </div>
            )}
            {jobType && (
              <div style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 100, padding: '8px 18px',
                color: '#cbd5e1', fontSize: 16, fontWeight: 500, textTransform: 'capitalize',
              }}>
                {jobType}
              </div>
            )}
            {salary && (
              <div style={{
                background: `${color}22`,
                border: `1px solid ${color}55`,
                borderRadius: 100, padding: '8px 18px',
                color: '#fff', fontSize: 16, fontWeight: 700,
              }}>
                💰 {salary}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#475569', fontSize: 15 }}>
            {slug}.freejobboard.ai
          </span>
          <div style={{
            background: color,
            borderRadius: 100, padding: '12px 28px',
            color: '#fff', fontSize: 16, fontWeight: 700,
          }}>
            View & Apply →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
