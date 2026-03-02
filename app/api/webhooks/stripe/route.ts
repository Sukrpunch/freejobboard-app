import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-02-25.clover' });
const serviceClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { board_id, app_slug } = session.metadata ?? {};
    const sub_id = session.subscription as string;

    if (board_id && app_slug) {
      await serviceClient.from('board_apps').upsert({
        board_id,
        app_slug,
        stripe_subscription_id: sub_id,
        active: true,
      }, { onConflict: 'board_id,app_slug' });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const { board_id, app_slug } = sub.metadata ?? {};
    if (board_id && app_slug) {
      await serviceClient.from('board_apps')
        .update({ active: false })
        .eq('board_id', board_id).eq('app_slug', app_slug);
    }
  }

  return NextResponse.json({ received: true });
}
