/**
 * POST /api/webhooks/stripe
 * Handle Stripe webhook events
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripeService } from '@/lib/payment/stripe-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Handle webhook
    await stripeService.handleWebhook(body, signature);

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Webhook] Stripe error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed', message: error.message },
      { status: 400 }
    );
  }
}
