import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const boardId = searchParams.get('board_id');
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!boardId) {
      return NextResponse.json({ error: 'board_id required' }, { status: 400 });
    }

    // Verify user owns the board
    const { data: board } = await supabase.from('boards').select('owner_id').eq('id', boardId).single();
    if (!board || board.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch resumes with full-text search
    let query = supabase
      .from('resumes')
      .select('id, candidate_name, candidate_email, file_name, created_at', { count: 'exact' })
      .eq('board_id', boardId)
      .order('created_at', { ascending: false });

    if (search.trim()) {
      query = query.or(`candidate_name.ilike.%${search}%,candidate_email.ilike.%${search}%`);
    }

    const { data: resumes, count, error } = await query
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      resumes,
      total: count || 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error('Resume list error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
