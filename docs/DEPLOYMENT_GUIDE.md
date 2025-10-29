# Cineverse Platform - Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup (Supabase)](#database-setup-supabase)
4. [Redis Setup (Upstash)](#redis-setup-upstash)
5. [Payment Setup (Stripe)](#payment-setup-stripe)
6. [Vercel Deployment](#vercel-deployment)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Git installed
- Vercel account (recommended for Next.js)
- Supabase account
- Upstash account (for Redis)
- Stripe account (for payments)
- GitHub/GitLab repository for your code

---

## Environment Setup

### 1. Clone and Install Dependencies

```bash
# Clone repository
git clone <your-repo-url>
cd nextjs-16-film

# Install dependencies
npm install

# or
yarn install
```

### 2. Create Environment Files

Create `.env.local` for development and `.env.production` for production:

```bash
# Create development environment file
cp .env.example .env.local
```

### 3. Required Environment Variables

```env
# ============================================
# APPLICATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Cineverse
NODE_ENV=development

# ============================================
# SUPABASE (Database & Auth)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ============================================
# REDIS (Upstash)
# ============================================
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# ============================================
# EXTERNAL MOVIE API
# ============================================
NEXT_PUBLIC_API_URL=https://cinevserse-api.nhatquang.shop

# ============================================
# STRIPE (Payments)
# ============================================
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ============================================
# ANALYTICS (Optional)
# ============================================
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
VERCEL_ANALYTICS_ID=your-analytics-id

# ============================================
# EMAIL (SendGrid or Resend)
# ============================================
SENDGRID_API_KEY=SG.xxx
SMTP_FROM=noreply@cineverse.com

# ============================================
# SECURITY
# ============================================
SESSION_SECRET=your-secret-key-min-32-chars
ENCRYPTION_KEY=your-encryption-key-32-chars
```

---

## Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note down:
   - Project URL
   - Anon public key
   - Service role key (keep secret!)

### 2. Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually run the migration SQL:

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Run the SQL

### 3. Configure Authentication Providers

Go to **Authentication → Providers** in Supabase Dashboard:

#### Email/Password
- Enable Email provider
- Configure email templates

#### OAuth Providers

**Google:**
1. Create OAuth credentials at [Google Cloud Console](https://console.cloud.google.com)
2. Add callback URL: `https://your-project.supabase.co/auth/v1/callback`
3. Add Client ID and Secret in Supabase

**Facebook:**
1. Create app at [Facebook Developers](https://developers.facebook.com)
2. Add callback URL
3. Add App ID and Secret in Supabase

**GitHub:**
1. Create OAuth app at [GitHub Settings](https://github.com/settings/developers)
2. Add callback URL
3. Add Client ID and Secret in Supabase

### 4. Configure Storage

Go to **Storage** in Supabase Dashboard:

Create buckets:
```sql
-- Create avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Create movie-posters bucket (if needed)
INSERT INTO storage.buckets (id, name, public)
VALUES ('movie-posters', 'movie-posters', true);
```

Set storage policies:
```sql
-- Allow authenticated users to upload avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

### 5. Enable Realtime

Go to **Database → Replication** and enable realtime for:
- `comments`
- `notifications`
- `user_activities`

---

## Redis Setup (Upstash)

### 1. Create Upstash Database

1. Go to [https://upstash.com](https://upstash.com)
2. Create new Redis database
3. Choose region close to your Vercel deployment
4. Copy REST URL and Token

### 2. Install Upstash Redis SDK

```bash
npm install @upstash/redis
```

### 3. Test Connection

```bash
# Create test script
node -e "
const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
redis.set('test', 'Hello Upstash').then(() =>
  redis.get('test').then(console.log)
);
"
```

---

## Payment Setup (Stripe)

### 1. Create Stripe Account

1. Sign up at [https://stripe.com](https://stripe.com)
2. Complete business verification

### 2. Create Products and Prices

```bash
# Using Stripe CLI
stripe products create --name="Basic Plan" --description="Basic subscription"

# Create monthly price
stripe prices create \
  --product=prod_xxx \
  --unit-amount=999 \
  --currency=usd \
  --recurring[interval]=month

# Create yearly price
stripe prices create \
  --product=prod_xxx \
  --unit-amount=9999 \
  --currency=usd \
  --recurring[interval]=year
```

Or use Stripe Dashboard:
1. Go to **Products** → **Add Product**
2. Create products for: Free, Basic, Premium, VIP
3. Add monthly and yearly prices
4. Note down Price IDs

### 3. Update Database with Price IDs

```sql
-- Update subscription plans with Stripe Price IDs
UPDATE subscription_plans
SET stripe_price_id = 'price_xxx'
WHERE tier = 'basic' AND billing_cycle = 'monthly';

UPDATE subscription_plans
SET stripe_price_id_yearly = 'price_yyy'
WHERE tier = 'basic' AND billing_cycle = 'yearly';
```

### 4. Configure Webhooks

1. Go to **Developers** → **Webhooks** in Stripe Dashboard
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events to listen:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy webhook signing secret
5. Add to environment variables

### 5. Test Stripe Integration

Use Stripe test mode:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Test card: `4242 4242 4242 4242`

---

## Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Link Project

```bash
# Login to Vercel
vercel login

# Link project
vercel link
```

### 3. Set Environment Variables

```bash
# Set production environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add UPSTASH_REDIS_REST_URL production
vercel env add UPSTASH_REDIS_REST_TOKEN production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production

# Or use Vercel Dashboard:
# Project Settings → Environment Variables
```

### 4. Configure Build Settings

Ensure `vercel.json` exists:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_APP_URL": "https://cineverse.com"
  }
}
```

### 5. Deploy

```bash
# Deploy to production
vercel --prod

# Or push to main branch (if GitHub integration is set up)
git push origin main
```

### 6. Configure Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records:
   - Type: A
   - Name: @
   - Value: 76.76.21.21
   - TTL: Auto

   OR

   - Type: CNAME
   - Name: www
   - Value: cname.vercel-dns.com
   - TTL: Auto

4. Wait for DNS propagation (5-60 minutes)

---

## Post-Deployment Configuration

### 1. Update Stripe Webhook URL

Update webhook endpoint to production URL:
```
https://your-domain.com/api/webhooks/stripe
```

### 2. Configure CORS

If using external APIs, ensure CORS is configured:

In `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: 'https://your-domain.com' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
      ],
    },
  ];
}
```

### 3. Set Up Cron Jobs

For background tasks (ML training, cache cleanup):

Create `/api/cron/` endpoints and configure Vercel Cron:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-recommendations",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/compute-similarities",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 4. Configure Email Templates

Set up email templates in your email provider (SendGrid/Resend):
- Welcome email
- Password reset
- Subscription confirmation
- Payment receipt
- Subscription expiry warning

### 5. Add Analytics

#### Vercel Analytics
```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Google Analytics
Add to `app/layout.tsx`:
```typescript
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
  `}
</Script>
```

---

## Monitoring & Maintenance

### 1. Error Tracking (Sentry)

```bash
npm install @sentry/nextjs
```

Initialize Sentry:
```bash
npx @sentry/wizard@latest -i nextjs
```

### 2. Logging

Use Vercel Logs or external service like Logtail:
```bash
npm install @logtail/node
```

### 3. Performance Monitoring

Monitor Core Web Vitals:
- Vercel Analytics
- Google PageSpeed Insights
- Lighthouse CI

### 4. Database Backups

Supabase automatically backs up your database:
- Point-in-time recovery: 7 days (Pro plan)
- Manual backups: Database → Backups

### 5. Uptime Monitoring

Use services like:
- Uptime Robot
- Pingdom
- Better Uptime

Configure alerts for:
- API endpoint failures
- Database connection issues
- Payment processing errors

### 6. Security Monitoring

- Enable Vercel's DDoS protection
- Monitor Supabase logs for suspicious activity
- Set up alerts for failed login attempts
- Regular dependency updates: `npm audit`

---

## Troubleshooting

### Database Connection Issues

```bash
# Test Supabase connection
curl -X GET "https://your-project.supabase.co/rest/v1/" \
  -H "apikey: your-anon-key"
```

### Redis Connection Issues

```bash
# Test Redis connection
curl https://your-redis.upstash.io/ping \
  -H "Authorization: Bearer your-token"
```

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

### Stripe Webhook Issues

1. Check webhook signing secret
2. Verify webhook URL is correct
3. Check Stripe logs in Dashboard
4. Test with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Performance Issues

1. Check Vercel Analytics for slow pages
2. Analyze bundle size:
```bash
npm run build
npx @next/bundle-analyzer
```

3. Optimize images:
- Use Next.js Image component
- Enable WebP/AVIF formats

4. Check Redis cache hit rate
5. Monitor Supabase query performance

---

## Deployment Checklist

Before going live:

- [ ] All environment variables set in Vercel
- [ ] Database migrations applied
- [ ] Stripe products and prices created
- [ ] Stripe webhooks configured
- [ ] OAuth providers configured
- [ ] Custom domain configured and SSL active
- [ ] Email templates configured
- [ ] Analytics installed
- [ ] Error tracking (Sentry) configured
- [ ] Cron jobs configured
- [ ] Security headers enabled
- [ ] Rate limiting tested
- [ ] Payment flow tested (test mode)
- [ ] Authentication flow tested
- [ ] Mobile responsiveness verified
- [ ] SEO metadata added
- [ ] robots.txt and sitemap.xml configured
- [ ] Performance benchmarks passed (Lighthouse > 90)
- [ ] Database backups verified
- [ ] Monitoring and alerts configured

---

## Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npm run type-check         # Check TypeScript

# Database
supabase db push           # Push migrations
supabase db pull           # Pull schema
supabase db reset          # Reset database

# Deployment
vercel                     # Deploy to preview
vercel --prod             # Deploy to production
vercel logs               # View logs
vercel env ls             # List environment variables

# Stripe
stripe listen             # Listen to webhooks
stripe products list      # List products
stripe prices list        # List prices
```

---

## Support & Resources

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase Documentation**: https://supabase.com/docs
- **Stripe Documentation**: https://stripe.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Redis (Upstash) Documentation**: https://docs.upstash.com

For issues or questions, create an issue in the GitHub repository.

---

**Last Updated**: 2025-10-29
**Version**: 1.0.0
