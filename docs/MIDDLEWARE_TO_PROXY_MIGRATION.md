# Middleware to Proxy Migration Guide (Next.js 16)

## 🚨 Breaking Change in Next.js 16

In Next.js 16, the `middleware.ts` file convention has been deprecated and replaced with `proxy.ts`.

## What Changed?

### File Naming
```bash
# ❌ OLD (Next.js 15 and earlier)
middleware.ts

# ✅ NEW (Next.js 16+)
proxy.ts
```

### Function Naming
```typescript
// ❌ OLD
export async function middleware(request: NextRequest) {
  // ...
}

// ✅ NEW
export async function proxy(request: NextRequest) {
  // ...
}
```

## Why This Change?

The name "middleware" was confusing because:
1. It implied server-side middleware like Express.js
2. It actually runs as a proxy/router layer
3. The name "proxy" better describes its actual behavior

The `proxy` function:
- Intercepts requests before they reach your application
- Can modify requests and responses
- Handles routing logic
- Perfect for authentication, redirects, and request manipulation

## Migration Steps

### 1. Rename the File
```bash
# Move middleware.ts to proxy.ts
mv middleware.ts proxy.ts
```

### 2. Update Function Name
```typescript
// proxy.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Change function name from 'middleware' to 'proxy'
export async function proxy(request: NextRequest) {
  // Your authentication/routing logic
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 3. Update All Imports (If Any)
If you have any files importing from middleware, update them:

```typescript
// ❌ OLD
import { middleware } from './middleware'

// ✅ NEW
import { proxy } from './proxy'
```

## Complete Example

Here's a complete `proxy.ts` file for authentication:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth condition
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/profile') ||
                          request.nextUrl.pathname.startsWith('/admin') ||
                          request.nextUrl.pathname.startsWith('/settings')

  // Redirect logic
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Key Points

### 1. Everything Else Stays the Same
- The `config` object works exactly the same
- Matchers work the same way
- Request/response handling is identical
- All Supabase auth code remains unchanged

### 2. Only Two Changes Required
1. Rename file: `middleware.ts` → `proxy.ts`
2. Rename function: `middleware` → `proxy`

### 3. No Behavior Changes
The functionality is **exactly the same** - only the naming convention changed for clarity.

## Common Use Cases

### 1. Authentication Check
```typescript
export async function proxy(request: NextRequest) {
  const session = await getSession(request)
  
  if (!session && isProtectedRoute(request)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}
```

### 2. Locale/i18n Routing
```typescript
export async function proxy(request: NextRequest) {
  const locale = request.cookies.get('locale')?.value || 'en'
  
  if (!request.nextUrl.pathname.startsWith(`/${locale}`)) {
    return NextResponse.redirect(
      new URL(`/${locale}${request.nextUrl.pathname}`, request.url)
    )
  }
  
  return NextResponse.next()
}
```

### 3. Custom Headers
```typescript
export async function proxy(request: NextRequest) {
  const response = NextResponse.next()
  
  response.headers.set('X-Custom-Header', 'value')
  response.headers.set('X-Frame-Options', 'DENY')
  
  return response
}
```

### 4. API Rate Limiting
```typescript
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const ip = request.ip || 'anonymous'
    const isRateLimited = await checkRateLimit(ip)
    
    if (isRateLimited) {
      return new NextResponse('Too Many Requests', { status: 429 })
    }
  }
  
  return NextResponse.next()
}
```

## Troubleshooting

### Warning Still Appears
If you still see the warning after renaming:
1. Restart your dev server
2. Clear `.next` folder: `rm -rf .next`
3. Reinstall dependencies: `npm install` or `yarn install`

### TypeScript Errors
If you get TypeScript errors:
1. Make sure you're exporting a function named `proxy`
2. Ensure the function signature matches: `(request: NextRequest) => Promise<NextResponse> | NextResponse`

### Config Not Working
The `config` export should remain unchanged:
```typescript
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

## Benefits of the Change

1. **Clearer Naming** - "proxy" better describes the actual behavior
2. **Less Confusion** - No more mixing up with server-side middleware
3. **Better Documentation** - Easier to find relevant documentation
4. **Future-Proof** - Aligns with Next.js's architectural vision

## Additional Resources

- [Next.js Proxy Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Migration Guide](https://nextjs.org/docs/messages/middleware-to-proxy)
- [NextRequest API](https://nextjs.org/docs/app/api-reference/functions/next-request)
- [NextResponse API](https://nextjs.org/docs/app/api-reference/functions/next-response)

## Summary

✅ **Do This:**
1. Rename `middleware.ts` to `proxy.ts`
2. Change function name from `middleware` to `proxy`
3. Keep everything else the same

❌ **Don't Do This:**
1. Don't try to use both files
2. Don't change the function signature
3. Don't modify the config object structure

---

**The migration is simple and straightforward - just a naming change for better clarity!** 🚀