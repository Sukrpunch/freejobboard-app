import { ImageResponse } from 'next/og';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = params;

  const { data: board } = await serviceClient
    .from('boards').select('name, description, primary_color').eq('slug', slug).single();

  const { count: jobCount } = await serviceClient
    .from('jobs').select('*', { count: 'exact', head: true })
    .eq('board_id', (await serviceClient.from('boards').select('id').eq('slug', slug).single()).data?.id)
    .eq('status', 'active');

  const boardName = board?.name ?? 'Job Board';
  const description = board?.description ?? 'Find your next opportunity';
  const color = board?.primary_color ?? '#6366f1';
  const jobs = jobCount ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200, height: 630,
          background: '#0f0f18',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: color }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 24, fontWeight: 900,
          }}>
            {boardName[0]}
          </div>
          <span style={{ color: '#94a3b8', fontSize: 20, fontWeight: 600 }}>Powered by FreeJobBoard.ai</span>
        </div>

        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', lineHeight: 1.05, letterSpacing: '-2px' }}>
            {boardName}
          </div>
          <div style={{ fontSize: 24, color: '#94a3b8', fontWeight: 400, maxWidth: 700 }}>
            {description}
          </div>
          {jobs > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: `${color}22`, border: `1px solid ${color}55`,
              borderRadius: 100, padding: '10px 22px', width: 'fit-content',
              color: '#fff', fontSize: 18, fontWeight: 700,
            }}>
              {jobs} open {jobs === 1 ? 'position' : 'positions'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#475569', fontSize: 15 }}>{slug}.freejobboard.ai</span>
          <div style={{ background: color, borderRadius: 100, padding: '12px 28px', color: '#fff', fontSize: 16, fontWeight: 700 }}>
            Browse Jobs →
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
