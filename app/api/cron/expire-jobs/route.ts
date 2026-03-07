import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  // Verify cron secret
  const auth = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const now = new Date().toISOString();

  // 1. Expire jobs past their expires_at date
  const { data: expired, error: expireErr } = await supabase
    .from('jobs')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('expires_at', now)
    .select('id, title');

  if (expireErr) {
    console.error('expire-jobs cron error:', expireErr);
    return NextResponse.json({ error: expireErr.message }, { status: 500 });
  }

  // 2. Set expires_at for active jobs that have none (default: 90 days from created_at)
  const { data: missingExpiry } = await supabase
    .from('jobs')
    .select('id, created_at')
    .is('expires_at', null)
    .eq('status', 'active');

  let backfilled = 0;
  if (missingExpiry && missingExpiry.length > 0) {
    for (const job of missingExpiry) {
      const expiryDate = new Date(job.created_at);
      expiryDate.setDate(expiryDate.getDate() + 90);
      await supabase
        .from('jobs')
        .update({ expires_at: expiryDate.toISOString() })
        .eq('id', job.id);
      backfilled++;
    }
  }

  const expiredCount = expired?.length ?? 0;
  console.log(`[cron/expire-jobs] Expired: ${expiredCount}, Backfilled expiry: ${backfilled}`);

  return NextResponse.json({
    success: true,
    expired: expiredCount,
    backfilled,
    expiredJobs: expired?.map(j => j.title) ?? [],
  });
}
