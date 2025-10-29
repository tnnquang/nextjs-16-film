/**
 * Stripe Payment Integration Service
 * Handles subscriptions, payments, and webhook events
 */

import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import type {
  SubscriptionPlan,
  UserSubscription,
  PaymentIntent as PaymentIntentType,
  SubscriptionCheckout,
} from '@/types/advanced';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// ============================================
// STRIPE SERVICE CLASS
// ============================================

export class StripeService {
  private supabase = createClient();

  // ============================================
  // CUSTOMER MANAGEMENT
  // ============================================

  /**
   * Get or create Stripe customer for user
   */
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    try {
      // Check if user already has a Stripe customer ID
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('metadata')
        .eq('id', userId)
        .single();

      const stripeCustomerId = profile?.metadata?.stripe_customer_id;

      if (stripeCustomerId) {
        // Verify customer exists in Stripe
        try {
          await stripe.customers.retrieve(stripeCustomerId);
          return stripeCustomerId;
        } catch (error) {
          // Customer doesn't exist, create new one
          console.log('[Stripe] Customer not found, creating new one');
        }
      }

      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email,
        metadata: {
          user_id: userId,
        },
      });

      // Store customer ID in user profile
      await this.supabase
        .from('user_profiles')
        .update({
          metadata: {
            ...profile?.metadata,
            stripe_customer_id: customer.id,
          },
        })
        .eq('id', userId);

      return customer.id;
    } catch (error) {
      console.error('[Stripe] Get or create customer error:', error);
      throw error;
    }
  }

  // ============================================
  // SUBSCRIPTION MANAGEMENT
  // ============================================

  /**
   * Create subscription checkout session
   */
  async createCheckoutSession(
    userId: string,
    email: string,
    checkout: SubscriptionCheckout
  ): Promise<{ sessionId: string; url: string }> {
    try {
      // Get or create customer
      const customerId = await this.getOrCreateCustomer(userId, email);

      // Get plan details
      const { data: plan } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', checkout.planId)
        .single();

      if (!plan) {
        throw new Error('Plan not found');
      }

      // Determine price ID based on billing cycle
      const priceId =
        checkout.billingCycle === 'yearly'
          ? plan.stripe_price_id_yearly
          : plan.stripe_price_id_monthly;

      if (!priceId) {
        throw new Error('Price ID not found for plan');
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: checkout.successUrl,
        cancel_url: checkout.cancelUrl,
        metadata: {
          user_id: userId,
          plan_id: checkout.planId,
          billing_cycle: checkout.billingCycle,
        },
        allow_promotion_codes: true,
        subscription_data: {
          metadata: {
            user_id: userId,
            plan_id: checkout.planId,
          },
          trial_period_days: plan.trial_days || undefined,
        },
      });

      return {
        sessionId: session.id,
        url: session.url!,
      };
    } catch (error) {
      console.error('[Stripe] Create checkout session error:', error);
      throw error;
    }
  }

  /**
   * Create subscription directly (without checkout)
   */
  async createSubscription(
    userId: string,
    email: string,
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    paymentMethodId: string
  ): Promise<UserSubscription> {
    try {
      // Get or create customer
      const customerId = await this.getOrCreateCustomer(userId, email);

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Get plan details
      const { data: plan } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (!plan) {
        throw new Error('Plan not found');
      }

      const priceId =
        billingCycle === 'yearly'
          ? plan.stripe_price_id_yearly
          : plan.stripe_price_id_monthly;

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          user_id: userId,
          plan_id: planId,
        },
      });

      // Store subscription in database
      const userSubscription = await this.storeSubscription(
        userId,
        planId,
        subscription
      );

      return userSubscription;
    } catch (error) {
      console.error('[Stripe] Create subscription error:', error);
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<UserSubscription> {
    try {
      // Get subscription from database
      const { data: dbSubscription } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (!dbSubscription) {
        throw new Error('Subscription not found');
      }

      // Cancel in Stripe
      if (cancelAtPeriodEnd) {
        await stripe.subscriptions.update(dbSubscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
      } else {
        await stripe.subscriptions.cancel(dbSubscription.stripe_subscription_id);
      }

      // Update in database
      const { data: updated } = await this.supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: cancelAtPeriodEnd,
          cancelled_at: new Date().toISOString(),
          status: cancelAtPeriodEnd ? 'active' : 'cancelled',
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      return updated as UserSubscription;
    } catch (error) {
      console.error('[Stripe] Cancel subscription error:', error);
      throw error;
    }
  }

  /**
   * Resume cancelled subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<UserSubscription> {
    try {
      const { data: dbSubscription } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (!dbSubscription) {
        throw new Error('Subscription not found');
      }

      // Resume in Stripe
      await stripe.subscriptions.update(dbSubscription.stripe_subscription_id, {
        cancel_at_period_end: false,
      });

      // Update in database
      const { data: updated } = await this.supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: false,
          status: 'active',
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      return updated as UserSubscription;
    } catch (error) {
      console.error('[Stripe] Resume subscription error:', error);
      throw error;
    }
  }

  /**
   * Update subscription (change plan)
   */
  async updateSubscription(
    subscriptionId: string,
    newPlanId: string,
    billingCycle: 'monthly' | 'yearly'
  ): Promise<UserSubscription> {
    try {
      const { data: dbSubscription } = await this.supabase
        .from('user_subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single();

      if (!dbSubscription) {
        throw new Error('Subscription not found');
      }

      // Get new plan
      const { data: newPlan } = await this.supabase
        .from('subscription_plans')
        .select('*')
        .eq('id', newPlanId)
        .single();

      if (!newPlan) {
        throw new Error('Plan not found');
      }

      const priceId =
        billingCycle === 'yearly'
          ? newPlan.stripe_price_id_yearly
          : newPlan.stripe_price_id_monthly;

      // Get current subscription from Stripe
      const stripeSubscription = await stripe.subscriptions.retrieve(
        dbSubscription.stripe_subscription_id
      );

      // Update subscription in Stripe
      const updated = await stripe.subscriptions.update(
        dbSubscription.stripe_subscription_id,
        {
          items: [
            {
              id: stripeSubscription.items.data[0].id,
              price: priceId,
            },
          ],
          proration_behavior: 'create_prorations',
        }
      );

      // Update in database
      const { data: updatedDb } = await this.supabase
        .from('user_subscriptions')
        .update({
          plan_id: newPlanId,
          billing_cycle: billingCycle,
          amount:
            billingCycle === 'yearly'
              ? newPlan.price_yearly
              : newPlan.price_monthly,
        })
        .eq('id', subscriptionId)
        .select()
        .single();

      return updatedDb as UserSubscription;
    } catch (error) {
      console.error('[Stripe] Update subscription error:', error);
      throw error;
    }
  }

  // ============================================
  // PAYMENT METHODS
  // ============================================

  /**
   * Get customer payment methods
   */
  async getPaymentMethods(userId: string): Promise<Stripe.PaymentMethod[]> {
    try {
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('metadata')
        .eq('id', userId)
        .single();

      const customerId = profile?.metadata?.stripe_customer_id;

      if (!customerId) {
        return [];
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('[Stripe] Get payment methods error:', error);
      return [];
    }
  }

  /**
   * Set default payment method
   */
  async setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<void> {
    try {
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('metadata')
        .eq('id', userId)
        .single();

      const customerId = profile?.metadata?.stripe_customer_id;

      if (!customerId) {
        throw new Error('Customer not found');
      }

      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    } catch (error) {
      console.error('[Stripe] Set default payment method error:', error);
      throw error;
    }
  }

  // ============================================
  // WEBHOOK HANDLING
  // ============================================

  /**
   * Handle Stripe webhook events
   */
  async handleWebhook(
    payload: string | Buffer,
    signature: string
  ): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    try {
      // Verify webhook signature
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret
      );

      console.log(`[Stripe] Webhook received: ${event.type}`);

      // Handle different event types
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutCompleted(event.data.object);
          break;

        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object);
          break;

        default:
          console.log(`[Stripe] Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('[Stripe] Webhook error:', error);
      throw error;
    }
  }

  /**
   * Handle checkout session completed
   */
  private async handleCheckoutCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const userId = session.metadata?.user_id;
    const planId = session.metadata?.plan_id;

    if (!userId || !planId) {
      console.error('[Stripe] Missing metadata in checkout session');
      return;
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    // Store subscription in database
    await this.storeSubscription(userId, planId, subscription);
  }

  /**
   * Handle subscription updated
   */
  private async handleSubscriptionUpdated(
    subscription: Stripe.Subscription
  ): Promise<void> {
    const userId = subscription.metadata.user_id;

    if (!userId) {
      console.error('[Stripe] Missing user_id in subscription metadata');
      return;
    }

    // Update subscription in database
    await this.supabase
      .from('user_subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
      })
      .eq('stripe_subscription_id', subscription.id);

    // Update user profile subscription tier
    await this.updateUserSubscriptionTier(userId);
  }

  /**
   * Handle subscription deleted
   */
  private async handleSubscriptionDeleted(
    subscription: Stripe.Subscription
  ): Promise<void> {
    const userId = subscription.metadata.user_id;

    if (!userId) return;

    // Update subscription in database
    await this.supabase
      .from('user_subscriptions')
      .update({
        status: 'expired',
      })
      .eq('stripe_subscription_id', subscription.id);

    // Update user profile to free tier
    await this.supabase
      .from('user_profiles')
      .update({
        subscription_tier: 'free',
        subscription_expires_at: null,
      })
      .eq('id', userId);
  }

  /**
   * Handle invoice paid
   */
  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = invoice.subscription as string;

    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata.user_id;

    if (!userId) return;

    // Record transaction
    await this.supabase.from('payment_transactions').insert({
      user_id: userId,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency.toUpperCase(),
      status: 'completed',
      payment_provider: 'stripe',
      provider_transaction_id: invoice.id,
      metadata: {
        invoice_number: invoice.number,
        subscription_id: subscriptionId,
      },
    });
  }

  /**
   * Handle invoice payment failed
   */
  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const subscriptionId = invoice.subscription as string;

    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata.user_id;

    if (!userId) return;

    // Update subscription status
    await this.supabase
      .from('user_subscriptions')
      .update({
        status: 'past_due',
      })
      .eq('stripe_subscription_id', subscriptionId);

    // TODO: Send notification to user about payment failure
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Store subscription in database
   */
  private async storeSubscription(
    userId: string,
    planId: string,
    subscription: Stripe.Subscription
  ): Promise<UserSubscription> {
    const { data: plan } = await this.supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      status: subscription.status,
      billing_cycle: subscription.items.data[0].price.recurring?.interval as
        | 'monthly'
        | 'yearly',
      amount: subscription.items.data[0].price.unit_amount! / 100,
      currency: subscription.currency.toUpperCase(),
      stripe_subscription_id: subscription.id,
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      trial_ends_at: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
    };

    const { data, error } = await this.supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'stripe_subscription_id',
      })
      .select()
      .single();

    if (error) throw error;

    // Update user profile
    await this.updateUserSubscriptionTier(userId);

    return data as UserSubscription;
  }

  /**
   * Update user subscription tier based on active subscription
   */
  private async updateUserSubscriptionTier(userId: string): Promise<void> {
    const { data: subscription } = await this.supabase
      .from('user_subscriptions')
      .select('plan:subscription_plans(*), current_period_end')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscription && subscription.plan) {
      await this.supabase
        .from('user_profiles')
        .update({
          subscription_tier: (subscription.plan as any).tier,
          subscription_expires_at: subscription.current_period_end,
        })
        .eq('id', userId);
    } else {
      // No active subscription, set to free
      await this.supabase
        .from('user_profiles')
        .update({
          subscription_tier: 'free',
          subscription_expires_at: null,
        })
        .eq('id', userId);
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();
