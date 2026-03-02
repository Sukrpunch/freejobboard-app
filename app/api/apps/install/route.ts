import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { AVAILABLE_APPS } from '@/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { app_slug } = await req.json();
  const app = AVAILABLE_APPS.find(a => a.slug === app_slug);
  if (!app || !app.price_id) return NextResponse.json({ error: 'App not available' }, { status: 400 });

  const { data: board } = await supabase.from('boards').select('id, name, slug').eq('owner_id', user.id).single();
  if (!board) return NextResponse.json({ error: 'Board not found' }, { status: 404 });

  // Check if already installed
  const { data: existing } = await supabase.from('board_apps')
    .select('id').eq('board_id', board.id).eq('app_slug', app_slug).eq('active', true).single();
  if (existing) return NextResponse.json({ error: 'Already installed' }, { status: 400 });

  // Create Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: app.price_id, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/apps?installed=${app_slug}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/apps`,
    metadata: {
      board_id: board.id,
      board_slug: board.slug,
      app_slug,
      user_id: user.id,
    },
    subscription_data: {
      metadata: {
        board_id: board.id,
        app_slug,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
