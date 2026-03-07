import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest) {
  try {
    const { application_id, status } = await req.json();

    const VALID = ['new', 'reviewed', 'shortlisted', 'rejected'];
    if (!application_id || !VALID.includes(status)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    // Auth check — verify caller owns the board
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const service = await createServiceClient();

    // Verify the application belongs to a job on the user's board
    const { data: app } = await service
      .from('applications')
      .select('id, job:jobs(board:boards(owner_id))')
      .eq('id', application_id)
      .single();

    const ownerIds = (app as { id: string; job: { board: { owner_id: string } } } | null)?.job?.board?.owner_id;
    if (!ownerIds || ownerIds !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await service.from('applications').update({ status }).eq('id', application_id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
