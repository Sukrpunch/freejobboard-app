'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const board_id = formData.get('board_id') as string;
  const name = formData.get('name') as string;
  const tagline = formData.get('tagline') as string || null;
  const category = formData.get('category') as string || null;
  const primary_color = formData.get('primary_color') as string;
  const custom_domain = formData.get('custom_domain') as string || null;

  await supabase.from('boards').update({
    name, tagline, category, primary_color, custom_domain,
  }).eq('id', board_id).eq('owner_id', user.id);

  revalidatePath('/dashboard/settings');
  redirect('/dashboard/settings?saved=1');
}
