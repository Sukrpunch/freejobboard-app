import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { job_id } = await req.json();
    if (!job_id) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 });

    const supabase = await createServiceClient();

    const { data: job } = await supabase
      .from('jobs')
      .select('id, title, company, location, job_type, salary_min, salary_max, salary_currency, description, board_id')
      .eq('id', job_id)
      .single();

    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const { data: board } = await supabase
      .from('boards')
      .select('name, slug')
      .eq('id', job.board_id)
      .single();

    if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 404 });

    // Get confirmed subscribers for this board
    const { data: alerts } = await supabase
      .from('job_alerts')
      .select('email, keywords')
      .eq('board_id', job.board_id)
      .eq('confirmed', true);

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const jobUrl = `https://${board.slug}.freejobboard.ai`;
    const salaryText = job.salary_min && job.salary_max
      ? `${job.salary_currency === 'GBP' ? '£' : '$'}${job.salary_min.toLocaleString()} – ${job.salary_currency === 'GBP' ? '£' : '$'}${job.salary_max.toLocaleString()}`
      : null;

    let sent = 0;
    for (const alert of alerts) {
      // Keyword matching: if no keywords, always send; otherwise check title/description
      const matches = !alert.keywords ||
        alert.keywords.split(',').some((kw: string) =>
          job.title.toLowerCase().includes(kw.trim().toLowerCase()) ||
          job.description.toLowerCase().includes(kw.trim().toLowerCase())
        );

      if (!matches) continue;

      await resend.emails.send({
        from: 'FreeJobBoard.ai <mason@bessjobs.com>',
        to: alert.email,
        subject: `New job on ${board.name}: ${job.title}`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b">
            <p style="margin:0 0 4px;color:#64748b;font-size:13px">${board.name}</p>
            <h2 style="font-size:22px;margin:0 0 16px;color:#0f172a">${job.title}</h2>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;width:100px;font-size:13px">Company</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px">${job.company}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:13px">Location</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px">${job.location}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#94a3b8;font-size:13px">Type</td><td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;text-transform:capitalize">${job.job_type.replace('-', ' ')}</td></tr>
              ${salaryText ? `<tr><td style="padding:8px 0;color:#94a3b8;font-size:13px">Salary</td><td style="padding:8px 0;font-size:13px;color:#16a34a">${salaryText}</td></tr>` : ''}
            </table>
            <a href="${jobUrl}" style="display:inline-block;background:#6366f1;color:#fff;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">View &amp; Apply →</a>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
            <p style="font-size:11px;color:#94a3b8">You're receiving this because you subscribed to job alerts on <a href="${jobUrl}" style="color:#94a3b8">${board.name}</a>.</p>
          </div>
        `,
      });
      sent++;
    }

    return NextResponse.json({ sent });
  } catch (err) {
    console.error('alerts/send error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
