# Cineverse Platform - Setup Guide

Complete setup instructions for local development and first-time configuration.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Required Dependencies](#required-dependencies)
4. [Local Development Setup](#local-development-setup)
5. [Database Setup](#database-setup)
6. [Service Integration](#service-integration)
7. [Testing](#testing)
8. [Development Workflow](#development-workflow)

---

## Prerequisites

Ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or yarn/pnpm)
- **Git**: Latest version
- **Text Editor**: VS Code (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

---

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd nextjs-16-film
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 16.0.1 with App Router
- React 19.2
- TypeScript 5.7
- Tailwind CSS v4
- Supabase client libraries
- Stripe SDK
- Upstash Redis
- TanStack Query
- And many more...

### 3. Install Additional Dependencies for New Features

```bash
# Install Stripe for payments
npm install stripe @stripe/stripe-js

# Install Upstash Redis for caching
npm install @upstash/redis

# Install analytics and monitoring
npm install @vercel/analytics

# Install email service (choose one)
npm install @sendgrid/mail  # SendGrid
# OR
npm install resend          # Resend

# Optional: Install Sentry for error tracking
npm install @sentry/nextjs
```

---

## Required Dependencies

### Core Dependencies (Already Installed)

```json
{
  "next": "^16.0.0",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "typescript": "^5.7.0",
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "^0.1.0",
  "@tanstack/react-query": "^5.8.0",
  "tailwindcss": "^4.1.16",
  "framer-motion": "^10.16.0",
  "swiper": "^11.0.0"
}
```

### New Dependencies (To Be Added)

```json
{
  "stripe": "^14.0.0",
  "@stripe/stripe-js": "^2.0.0",
  "@upstash/redis": "^1.25.0",
  "@vercel/analytics": "^1.1.0",
  "@sendgrid/mail": "^8.0.0",
  "resend": "^2.0.0"
}
```

---

## Local Development Setup

### 1. Environment Variables

Create `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Fill in the following variables:

```env
# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Cineverse
NODE_ENV=development

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Upstash Redis (for caching and rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# External Movie API
NEXT_PUBLIC_API_URL=https://cinevserse-api.nhatquang.shop

# Stripe (use test keys for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (optional for local dev)
SENDGRID_API_KEY=
SMTP_FROM=dev@localhost

# Security
SESSION_SECRET=your-dev-secret-min-32-characters
ENCRYPTION_KEY=your-encryption-key-32-chars
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

---

## Database Setup

### Option 1: Using Supabase Cloud (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Wait for provisioning (~2 minutes)

2. **Get Connection Details**
   - Project Settings → API
   - Copy:
     - Project URL
     - Anon public key
     - Service role key

3. **Run Migrations**

Using Supabase CLI:
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

Or manually:
```bash
# Copy migration SQL
cat supabase/migrations/001_initial_schema.sql

# Go to Supabase Dashboard → SQL Editor
# Paste and run the SQL
```

4. **Verify Tables Created**
```bash
# In Supabase Dashboard → Table Editor
# You should see:
- user_profiles
- user_follows
- user_activities
- comments
- movie_ratings
- ml_user_interactions
- subscription_plans
# ... and more
```

### Option 2: Using Local Supabase (Advanced)

```bash
# Start local Supabase
supabase start

# Run migrations
supabase db reset

# Get local credentials
supabase status

# Update .env.local with local URLs
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
```

---

## Service Integration

### 1. Supabase Authentication Setup

Configure OAuth providers in Supabase Dashboard:

**Google OAuth:**
```bash
# 1. Go to Google Cloud Console
# 2. Create OAuth 2.0 Client ID
# 3. Authorized redirect URIs:
https://<your-project>.supabase.co/auth/v1/callback

# 4. In Supabase Dashboard → Authentication → Providers
# 5. Enable Google, add Client ID and Secret
```

**GitHub OAuth:**
```bash
# 1. Go to GitHub Settings → Developer settings → OAuth Apps
# 2. Create new OAuth App
# 3. Authorization callback URL:
https://<your-project>.supabase.co/auth/v1/callback

# 4. In Supabase Dashboard, enable GitHub provider
```

**Email Configuration:**
```bash
# In Supabase Dashboard → Authentication → Email Templates
# Customize:
- Confirmation email
- Password reset email
- Magic link email
```

### 2. Redis Setup (Upstash)

```bash
# 1. Sign up at upstash.com
# 2. Create new Redis database
# 3. Choose region (close to your Vercel region)
# 4. Copy REST URL and Token
# 5. Add to .env.local
```

Test connection:
```bash
node -e "
const { Redis } = require('@upstash/redis');
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
redis.set('test', 'working').then(() =>
  redis.get('test').then(console.log)
);
"
```

### 3. Stripe Setup

```bash
# 1. Sign up at stripe.com
# 2. Get test API keys (Dashboard → Developers → API keys)

# 3. Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# OR download from stripe.com/docs/stripe-cli

# 4. Login to Stripe CLI
stripe login

# 5. Forward webhooks to local dev
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# 6. Copy webhook signing secret to .env.local
```

Create test products:
```bash
# Using Stripe Dashboard:
# Products → Add product
# Create: Free, Basic, Premium, VIP plans
# Add monthly and yearly prices
# Copy Price IDs
```

### 4. Email Service Setup

**Option A: SendGrid**
```bash
# 1. Sign up at sendgrid.com
# 2. Create API key
# 3. Verify sender email
# 4. Add API key to .env.local
```

**Option B: Resend**
```bash
# 1. Sign up at resend.com
# 2. Add domain
# 3. Create API key
# 4. Add to .env.local
```

---

## Testing

### 1. Test Authentication

```bash
# 1. Start dev server
npm run dev

# 2. Go to http://localhost:3000/register
# 3. Create test account
# 4. Check Supabase Dashboard → Authentication → Users
# 5. Verify user_profiles table has entry
```

### 2. Test Database Connections

```bash
# Create test script: test-db.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testDB() {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*');

  console.log('Plans:', data);
  console.log('Error:', error);
}

testDB();
```

Run test:
```bash
node test-db.js
```

### 3. Test Stripe Integration

```bash
# 1. Use test card: 4242 4242 4242 4242
# 2. Go to /pricing
# 3. Select plan
# 4. Complete checkout
# 5. Check Stripe Dashboard → Payments
# 6. Verify webhook received
```

### 4. Test Real-time Features

```bash
# 1. Open two browser windows
# 2. Go to same movie page
# 3. Post comment in one window
# 4. Verify it appears in other window (real-time)
```

---

## Development Workflow

### 1. Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request
```

### 2. Code Quality

```bash
# Before committing:
npm run lint           # Check linting
npm run type-check     # Check TypeScript
npm run format:check   # Check formatting

# Auto-fix issues:
npm run format         # Fix formatting
```

### 3. Database Changes

```bash
# Create new migration
supabase migration new migration_name

# Edit migration file in supabase/migrations/
# Add SQL changes

# Apply migration
supabase db push
```

### 4. Adding New Features

Follow this structure:
```
1. Create types in /types/
2. Create API route in /app/api/
3. Create service in /lib/
4. Create component in /components/
5. Add page in /app/
6. Update tests
```

### 5. Debugging

**Server-side:**
```typescript
console.log('[DEBUG]', data);
```

**Client-side:**
```typescript
'use client';
console.log('[CLIENT]', data);
```

**React Query DevTools:**
```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Add to layout
<ReactQueryDevtools initialIsOpen={false} />
```

**Supabase Logs:**
```bash
# Real-time logs
supabase logs tail
```

---

## Common Issues & Solutions

### Issue: "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules .next package-lock.json
npm install
```

### Issue: "Supabase connection failed"
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify project is running (for local)
supabase status
```

### Issue: "Redis connection timeout"
```bash
# Check Upstash dashboard
# Verify region matches your location
# Try creating new database
```

### Issue: "Stripe webhook not working"
```bash
# Ensure Stripe CLI is running
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Check webhook secret matches .env.local
```

### Issue: "Build fails on Vercel"
```bash
# Ensure all environment variables are set in Vercel
# Check build logs for specific error
# Try building locally first:
npm run build
```

---

## Next Steps

After setup is complete:

1. ✅ **Review Implementation Plan**: `docs/IMPLEMENTATION_PLAN.md`
2. ✅ **Understand Architecture**: Study the database schema
3. ✅ **Customize Features**: Modify components to match your needs
4. ✅ **Add Content**: Populate movies, categories, countries
5. ✅ **Test Thoroughly**: All features before deployment
6. ✅ **Deploy**: Follow `docs/DEPLOYMENT_GUIDE.md`

---

## Resources

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Stripe Documentation](https://stripe.com/docs)
- [TanStack Query Documentation](https://tanstack.com/query)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

## Getting Help

If you encounter issues:

1. Check this guide first
2. Search existing GitHub issues
3. Review implementation plan
4. Check service status pages:
   - [Supabase Status](https://status.supabase.com)
   - [Stripe Status](https://status.stripe.com)
   - [Vercel Status](https://www.vercel-status.com)
5. Create GitHub issue with:
   - Environment details
   - Error messages
   - Steps to reproduce

---

**Happy Coding! 🚀**

Last Updated: 2025-10-29
