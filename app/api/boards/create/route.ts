import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, slug, name } = await request.json();
    if (!userId || !slug || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const { error } = await serviceClient.from('boards').insert({
      slug,
      name,
      owner_id: userId,
    });

    if (error) {
      console.error('Board create error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
