import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { job_id, name, email, cover_note } = await req.json();

    if (!job_id || !name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Fetch job + board
    const { data: job, error: jobErr } = await supabase
      .from('jobs')
      .select('id, title, company, apply_email, board_id')
      .eq('id', job_id)
      .eq('status', 'active')
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const { data: board } = await supabase
      .from('boards')
      .select('name, slug')
      .eq('id', job.board_id)
      .single();

    // Insert application
    await supabase.from('applications').insert({
      job_id: job.id,
      name,
      email,
      cover_note: cover_note || null,
      status: 'new',
    });

    // Send notification email to employer
    if (job.apply_email) {
      const dashboardUrl = `https://app.freejobboard.ai/dashboard/applicants`;
      await resend.emails.send({
        from: 'FreeJobBoard.ai <mason@bessjobs.com>',
        to: job.apply_email,
        subject: `New applicant for ${job.title} — ${name}`,
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#1e293b">
            <h2 style="font-size:20px;margin:0 0 16px">New Application Received</h2>
            <p style="margin:0 0 20px;color:#64748b">Someone applied to <strong>${job.title}</strong> at <strong>${job.company}</strong> on <a href="https://${board?.slug}.freejobboard.ai" style="color:#6366f1">${board?.name}</a>.</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
              <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#94a3b8;width:120px">Name</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:600">${name}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#94a3b8">Email</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0"><a href="mailto:${email}" style="color:#6366f1">${email}</a></td></tr>
              ${cover_note ? `<tr><td style="padding:10px 0;color:#94a3b8;vertical-align:top">Note</td><td style="padding:10px 0">${cover_note.replace(/\n/g, '<br/>')}</td></tr>` : ''}
            </table>
            <a href="${dashboardUrl}" style="display:inline-block;background:#6366f1;color:#fff;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px">View in Dashboard →</a>
            <p style="margin-top:32px;font-size:12px;color:#94a3b8">FreeJobBoard.ai · <a href="https://freejobboard.ai" style="color:#94a3b8">freejobboard.ai</a></p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Apply error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
