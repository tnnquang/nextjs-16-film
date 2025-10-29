/**
 * Next.js 16+ Middleware
 * Handles authentication, rate limiting, analytics, and security
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Note: Redis client will be initialized when Upstash is configured
// import { rateLimiter, CACHE_KEYS } from '@/lib/redis/client';

// ============================================
// CONFIGURATION
// ============================================

const RATE_LIMITS = {
  api: { requests: 100, window: 60 }, // 100 requests per minute
  search: { requests: 20, window: 60 },
  auth: { requests: 5, window: 300 }, // 5 login attempts per 5 minutes
  comments: { requests: 10, window: 60 },
};

const PROTECTED_ROUTES = [
  '/profile',
  '/watch',
  '/api/favorites',
  '/api/watchlist',
  '/api/comments',
  '/api/ratings',
];

const ADMIN_ROUTES = ['/admin'];

const AUTH_ROUTES = ['/login', '/register'];

const PUBLIC_ROUTES = ['/', '/movies', '/categories', '/countries', '/search', '/blog'];

// ============================================
// MAIN MIDDLEWARE FUNCTION
// ============================================

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const response = NextResponse.next();

  // Skip middleware for static files and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/_next') ||
    pathname.includes('/static/') ||
    pathname.includes('.') && !pathname.includes('/api/')
  ) {
    return response;
  }

  try {
    // ============================================
    // 1. SUPABASE AUTH MIDDLEWARE
    // ============================================
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Get user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    // Log session errors (but don't block)
    if (sessionError) {
      console.error('[Middleware] Session error:', sessionError);
    }

    // ============================================
    // 2. ROUTE PROTECTION
    // ============================================

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

    // Redirect to login if accessing protected route without session
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect to home if accessing auth routes while logged in
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Check admin role for admin routes
    if (isAdminRoute) {
      if (!session) {
        const redirectUrl = new URL('/login', request.url);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Fetch user profile to check role
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'moderator')) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // ============================================
    // 3. RATE LIMITING
    // ============================================
    // Note: Uncomment when Redis/Upstash is configured
    /*
    const rateLimitKey = getRateLimitKey(request, pathname);
    const rateLimitScope = getRateLimitScope(pathname);

    if (rateLimitKey && rateLimitScope) {
      const limit = RATE_LIMITS[rateLimitScope as keyof typeof RATE_LIMITS] || RATE_LIMITS.api;

      const result = await rateLimiter.checkLimitSimple(
        rateLimitKey,
        rateLimitScope,
        limit
      );

      if (!result.allowed) {
        return new NextResponse(
          JSON.stringify({
            error: 'Too many requests',
            message: 'Please try again later',
            retryAfter: result.reset,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': result.reset.toString(),
              'Retry-After': (result.reset - Math.floor(Date.now() / 1000)).toString(),
            },
          }
        );
      }

      // Add rate limit headers
      response.headers.set('X-RateLimit-Limit', limit.requests.toString());
      response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
      response.headers.set('X-RateLimit-Reset', result.reset.toString());
    }
    */

    // ============================================
    // 4. ANALYTICS & TRACKING
    // ============================================
    if (!pathname.startsWith('/_next') && !pathname.startsWith('/api/')) {
      // Track page view asynchronously (fire and forget)
      trackPageView(request, session?.user.id).catch((error) => {
        console.error('[Middleware] Analytics error:', error);
      });
    }

    // ============================================
    // 5. SECURITY HEADERS
    // ============================================
    const securityHeaders = {
      // Prevent MIME type sniffing
      'X-Content-Type-Options': 'nosniff',

      // Prevent clickjacking
      'X-Frame-Options': 'DENY',

      // XSS Protection
      'X-XSS-Protection': '1; mode=block',

      // Referrer Policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',

      // Permissions Policy
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

      // Strict Transport Security (HSTS)
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add user info to response headers (for debugging, remove in production)
    if (session && process.env.NODE_ENV === 'development') {
      response.headers.set('X-User-Id', session.user.id);
      response.headers.set('X-User-Email', session.user.email || '');
    }

    return response;
  } catch (error) {
    console.error('[Middleware] Unexpected error:', error);

    // On error, allow the request to continue (fail open)
    // but log the error for monitoring
    return response;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get rate limit identifier (IP or user ID)
 */
function getRateLimitKey(request: NextRequest, pathname: string): string | null {
  // API routes
  if (pathname.startsWith('/api/')) {
    // Try to get user ID from session if available
    // Otherwise fall back to IP address
    const ip =
      request.ip ||
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    return `${ip}`;
  }

  return null;
}

/**
 * Get rate limit scope based on route
 */
function getRateLimitScope(pathname: string): string {
  if (pathname.startsWith('/api/search')) return 'search';
  if (pathname.startsWith('/api/auth')) return 'auth';
  if (pathname.startsWith('/api/comments')) return 'comments';
  return 'api';
}

/**
 * Track page view for analytics
 */
async function trackPageView(request: NextRequest, userId?: string): Promise<void> {
  try {
    const analyticsData = {
      path: request.nextUrl.pathname,
      referrer: request.headers.get('referer') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
      userId,
      timestamp: new Date().toISOString(),
      country: request.geo?.country,
      city: request.geo?.city,
    };

    // In production, this would send to your analytics service
    // For now, we'll just log it in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', analyticsData);
    }

    // TODO: Send to analytics service
    // await fetch('/api/analytics/track', {
    //   method: 'POST',
    //   body: JSON.stringify(analyticsData),
    // });
  } catch (error) {
    // Silently fail - analytics should not block requests
    console.error('[Analytics] Track error:', error);
  }
}

/**
 * Get client IP address
 */
function getClientIp(request: NextRequest): string {
  return (
    request.ip ||
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ============================================
// MIDDLEWARE CONFIGURATION
// ============================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public folder files
     * - static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
  ],
};
