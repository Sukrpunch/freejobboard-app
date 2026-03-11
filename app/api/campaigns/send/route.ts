import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { board_id, job_ids, subject } = await req.json();

    if (!board_id || !job_ids || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!Array.isArray(job_ids) || job_ids.length === 0) {
      return NextResponse.json({ error: 'job_ids must be a non-empty array' }, { status: 400 });
    }

    // Auth: verify user owns the board
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: board } = await supabase
      .from('boards')
      .select('id, name, slug, owner_id')
      .eq('id', board_id)
      .single();

    if (!board || board.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if alert-campaigns app is installed and active
    const { data: campaignsApp } = await supabase
      .from('board_apps')
      .select('id')
      .eq('board_id', board_id)
      .eq('app_slug', 'alert-campaigns')
      .eq('active', true)
      .maybeSingle();

    if (!campaignsApp) {
      return NextResponse.json({ error: 'Alert Campaigns app not installed' }, { status: 403 });
    }

    // Use service client to fetch jobs and subscribers (bypass RLS)
    const serviceClient = await createServiceClient();

    // Fetch selected jobs
    const { data: jobs } = await serviceClient
      .from('jobs')
      .select('id, title, company, location, job_type, salary_min, salary_max, salary_currency, description')
      .eq('board_id', board_id)
      .in('id', job_ids)
      .eq('status', 'active');

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ error: 'No active jobs found' }, { status: 400 });
    }

    // Fetch all confirmed subscribers
    const { data: subscribers } = await serviceClient
      .from('job_alerts')
      .select('email, keywords')
      .eq('board_id', board_id)
      .eq('confirmed', true);

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const jobUrl = `https://${board.slug}.freejobboard.ai`;
    let sent = 0;

    // Send one email per subscriber with all jobs in digest format
    for (const subscriber of subscribers) {
      // Build job cards for email
      const jobCards = jobs
        .map((job) => {
          const salaryText = job.salary_min && job.salary_max
            ? `${job.salary_currency === 'GBP' ? '£' : '$'}${job.salary_min.toLocaleString()} – ${job.salary_currency === 'GBP' ? '£' : '$'}${job.salary_max.toLocaleString()}`
            : 'Not specified';

          return `
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 600; color: #0f172a">${job.title}</h3>
              <p style="margin: 0 0 12px; font-size: 13px; color: #64748b">${job.company} • ${job.location}</p>
              <table style="width: 100%; border-collapse: collapse; font-size: 13px">
                <tr>
                  <td style="padding: 4px 0; color: #94a3b8">Type</td>
                  <td style="padding: 4px 0; text-align: right; text-transform: capitalize">${job.job_type.replace('-', ' ')}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #94a3b8">Salary</td>
                  <td style="padding: 4px 0; text-align: right; color: #16a34a">${salaryText}</td>
                </tr>
              </table>
            </div>
          `;
        })
        .join('');

      const emailHtml = `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b">
          <p style="margin:0 0 4px;color:#64748b;font-size:13px">${board.name}</p>
          <h2 style="font-size:22px;margin:0 0 20px;color:#0f172a">${subject}</h2>
          <div>${jobCards}</div>
          <a href="${jobUrl}" style="display:inline-block;background:#6366f1;color:#fff;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;margin-top:12px">View All Jobs →</a>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
          <p style="font-size:11px;color:#94a3b8;margin:0">You're receiving this because you subscribed to job alerts on <a href="${jobUrl}" style="color:#94a3b8">${board.name}</a>. <a href="${jobUrl}/unsubscribe" style="color:#94a3b8">Unsubscribe</a>.</p>
        </div>
      `;

      await resend.emails.send({
        from: 'FreeJobBoard.ai <mason@bessjobs.com>',
        to: subscriber.email,
        subject: subject,
        html: emailHtml,
      });

      sent++;
    }

    // Log to campaigns table
    await serviceClient.from('campaigns').insert({
      board_id,
      subject,
      job_count: jobs.length,
      recipient_count: sent,
      sent_at: new Date().toISOString(),
    });

    return NextResponse.json({ sent });
  } catch (err) {
    console.error('campaigns/send error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
