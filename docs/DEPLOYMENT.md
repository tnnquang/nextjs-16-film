# Deployment Guide

## Quick Deployment Options

### 1. Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications:

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

2. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_API_BASE_URL=https://cinevserse-api.nhatquang.shop
   ```

3. **Deploy**
   - Click "Deploy"
   - Automatic deployments on every push

### 2. Netlify

1. **Build Settings**
   ```
   Build command: npm run build
   Publish directory: .next
   ```

2. **Environment Variables**
   Add the same variables as Vercel

### 3. Railway

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repo

2. **Environment Variables**
   Add variables in Railway dashboard

### 4. Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production

   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY . .
   COPY --from=deps /app/node_modules ./node_modules
   RUN npm run build

   FROM node:18-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production

   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json

   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and Run**
   ```bash
   docker build -t cineverse .
   docker run -p 3000:3000 cineverse
   ```

## Production Checklist

### Before Deployment

- [ ] Set up Supabase project
- [ ] Configure authentication providers
- [ ] Set up database schema
- [ ] Test all environment variables
- [ ] Run production build locally
- [ ] Optimize images and assets
- [ ] Test API endpoints

### After Deployment

- [ ] Verify SSL certificate
- [ ] Test all routes and functionality
- [ ] Check performance metrics
- [ ] Set up monitoring and analytics
- [ ] Configure CDN (if needed)
- [ ] Set up error tracking (Sentry)

### Environment Variables

Required for all deployments:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# API
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_APP_URL=

# Optional OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
```

### Performance Optimization

1. **Image Optimization**
   - Configure `next.config.js` for your CDN
   - Use WebP/AVIF formats
   - Implement lazy loading

2. **Caching**
   - Set up Redis for session storage
   - Configure CDN caching rules
   - Use Next.js ISR where appropriate

3. **Monitoring**
   - Set up Vercel Analytics
   - Configure error tracking
   - Monitor Core Web Vitals

### Security

1. **Headers**
   - Configure security headers in `next.config.js`
   - Set up CORS policies
   - Use HTTPS everywhere

2. **Environment**
   - Never expose sensitive keys
   - Use different keys for staging/production
   - Regular key rotation

### Scaling

1. **Database**
   - Monitor Supabase usage
   - Set up connection pooling
   - Consider read replicas

2. **API**
   - Implement rate limiting
   - Cache API responses
   - Use edge functions when possible

3. **CDN**
   - Configure geographic distribution
   - Set up edge caching
   - Optimize asset delivery