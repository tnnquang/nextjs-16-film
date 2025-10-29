/**
 * POST /api/subscriptions/checkout
 * Create Stripe checkout session for subscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripeService } from '@/lib/payment/stripe-service';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { planId, billingCycle } = body;

    if (!planId || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user email
    const email = user.email || '';

    // Create checkout session
    const { sessionId, url } = await stripeService.createCheckoutSession(
      user.id,
      email,
      {
        planId,
        billingCycle,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        url,
      },
    });
  } catch (error) {
    console.error('[API] Create checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
