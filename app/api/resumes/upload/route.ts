import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const boardId = formData.get('board_id') as string;
    const candidateName = formData.get('candidate_name') as string;

    if (!file || !boardId || !candidateName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!file.type.includes('pdf') && !file.type.includes('document') && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'Only PDF files accepted' }, { status: 400 });
    }

    // For MVP, store candidate name in parsed_text (Phase 2: actual PDF parsing)
    const parsedText = candidateName;

    // Upload to Supabase Storage
    const fileName = `${boardId}/${Date.now()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from('resumes')
      .upload(fileName, file, { contentType: 'application/pdf' });

    if (uploadErr) {
      console.error('Storage upload error:', uploadErr);
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(fileName);

    // Insert into database
    const service = await createServiceClient();
    const { data: resume, error: dbErr } = await service
      .from('resumes')
      .insert({
        board_id: boardId,
        candidate_name: candidateName,
        candidate_email: user.email || '',
        file_name: file.name,
        file_path: fileName,
        file_size: file.size,
        mime_type: file.type,
        parsed_text: parsedText,
      })
      .select('id')
      .single();

    if (dbErr) {
      console.error('DB insert error:', dbErr);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      resume_id: resume?.id,
      public_url: publicUrl,
    });
  } catch (err) {
    console.error('Resume upload error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
