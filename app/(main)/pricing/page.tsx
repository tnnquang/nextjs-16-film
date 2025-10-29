import { Metadata } from 'next';
import { PricingContent } from './pricing-content';

export const metadata: Metadata = {
  title: 'Pricing Plans - Cineverse',
  description: 'Choose the perfect plan for your movie streaming needs',
};

export default function PricingPage() {
  return <PricingContent />;
}
