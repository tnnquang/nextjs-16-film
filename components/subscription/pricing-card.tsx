'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PricingCardProps {
  plan: {
    id: string;
    name: string;
    tier: string;
    price_monthly: number;
    price_yearly: number;
    features: {
      ads: boolean;
      quality: string;
      downloads: boolean;
      offline?: boolean;
      early_access?: boolean;
    };
    max_concurrent_streams: number;
    is_active: boolean;
  };
  billingCycle: 'monthly' | 'yearly';
  currentTier?: string;
}

export function PricingCard({ plan, billingCycle, currentTier }: PricingCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const price = billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly;
  const isCurrentPlan = currentTier === plan.tier;
  const isFree = plan.tier === 'free';

  const handleSubscribe = async () => {
    if (isFree || isCurrentPlan) return;

    setLoading(true);

    try {
      const response = await fetch('/api/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { data } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const features = [
    `${plan.max_concurrent_streams} concurrent ${plan.max_concurrent_streams === 1 ? 'stream' : 'streams'}`,
    `${plan.features.quality} quality`,
    plan.features.ads ? 'With ads' : 'No ads',
    plan.features.downloads && 'Downloads',
    plan.features.offline && 'Offline viewing',
    plan.features.early_access && 'Early access to new content',
  ].filter(Boolean);

  return (
    <Card className={`relative ${plan.tier === 'premium' ? 'border-primary shadow-lg' : ''}`}>
      {plan.tier === 'premium' && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
            MOST POPULAR
          </span>
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>
          <span className="text-3xl font-bold">${price.toFixed(2)}</span>
          <span className="text-muted-foreground">
            /{billingCycle === 'monthly' ? 'month' : 'year'}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={plan.tier === 'premium' ? 'default' : 'outline'}
          disabled={isCurrentPlan || loading || isFree}
          onClick={handleSubscribe}
        >
          {loading
            ? 'Loading...'
            : isCurrentPlan
            ? 'Current Plan'
            : isFree
            ? 'Free'
            : 'Subscribe'}
        </Button>
      </CardFooter>
    </Card>
  );
}
