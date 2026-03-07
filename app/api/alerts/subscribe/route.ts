import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { board_slug, email } = await req.json();
    if (!board_slug || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data: board } = await supabase
      .from('boards')
      .select('id')
      .eq('slug', board_slug)
      .eq('approved', true)
      .single();

    if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 404 });

    await supabase.from('job_alerts').upsert(
      { board_id: board.id, email, confirmed: true },
      { onConflict: 'board_id,email' }
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
