import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { resume_id, board_id } = await req.json();
    if (!resume_id || !board_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Verify user owns the board
    const { data: board } = await supabase.from('boards').select('owner_id').eq('id', board_id).single();
    if (!board || board.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify resume belongs to this board
    const { data: resume } = await supabase
      .from('resumes')
      .select('id, file_path')
      .eq('id', resume_id)
      .eq('board_id', board_id)
      .single();

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Log download
    const service = await createServiceClient();
    await service.from('resume_downloads').insert({
      resume_id,
      board_id,
      downloaded_by_email: user.email,
    });

    // Get public URL for redirect
    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(resume.file_path);

    return NextResponse.json({ download_url: publicUrl });
  } catch (err) {
    console.error('Resume download error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
