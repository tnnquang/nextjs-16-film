# Supabase SSR Migration Guide

## Overview

This project uses the new **`@supabase/ssr`** package instead of the deprecated `@supabase/auth-helpers-nextjs`. This is the recommended approach for Next.js 13+ with App Router.

## Key Changes

### 1. Package Updates

**Old (Deprecated):**
```json
"@supabase/auth-helpers-nextjs": "^0.8.7"
```

**New (Recommended):**
```json
"@supabase/ssr": "^0.1.0"
```

### 2. Client-Side Usage

**Old:**
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabase = createClientComponentClient()
```

**New:**
```typescript
import { createBrowserClient } from '@supabase/ssr'

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 3. Server-Side Usage

**Old:**
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabase = createServerComponentClient({ cookies })
```

**New:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

### 4. Middleware Usage

**Old:**
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  await supabase.auth.getSession()
  return res
}
```

**New:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
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

  await supabase.auth.getUser()
  return response
}
```

### 5. Route Handler Usage

**Old:**
```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  // ...
}
```

**New:**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
  // ...
}
```

## Benefits of the New Approach

### 1. **Better Server Component Support**
- Works seamlessly with React Server Components
- Proper async/await support for cookies
- No more "dynamic" route warnings

### 2. **Improved Type Safety**
- Better TypeScript types
- More explicit cookie handling
- Clearer error messages

### 3. **Enhanced Performance**
- More efficient cookie management
- Better caching strategies
- Reduced bundle size

### 4. **Future-Proof**
- Aligned with Next.js 13+ best practices
- Active development and support
- Regular updates from Supabase team

## Usage Examples

### Client Component (Login Form)

```typescript
'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      console.error('Login error:', error)
    } else {
      console.log('Login successful:', data)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  )
}
```

### Server Component (Fetch User Data)

```typescript
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div>
      <h1>Welcome, {profile?.full_name}</h1>
    </div>
  )
}
```

### Server Action (Update Profile)

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: formData.get('full_name'),
      bio: formData.get('bio'),
    })
    .eq('id', user.id)

  if (error) {
    throw error
  }

  revalidatePath('/profile')
}
```

## Migration Checklist

- ✅ Updated package.json dependencies
- ✅ Migrated client-side authentication
- ✅ Updated server components
- ✅ Updated middleware
- ✅ Updated route handlers
- ✅ Updated auth callback
- ✅ Tested authentication flow
- ✅ Tested protected routes
- ✅ Tested OAuth providers

## Troubleshooting

### Issue: Cookies not being set in Server Components

**Solution:** Make sure you're using the `try/catch` blocks in the cookie handlers as shown in the examples above. Server Components can't set cookies directly, but middleware will handle the refresh.

### Issue: Session not persisting across requests

**Solution:** Ensure your middleware is properly configured and running on all routes that need authentication.

### Issue: TypeScript errors with cookies

**Solution:** Update your TypeScript version to 5.0+ and ensure you're using `await cookies()` in async contexts.

## Resources

- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
- [Supabase Auth Helpers Migration Guide](https://supabase.com/docs/guides/auth/server-side/migrating-to-ssr-from-auth-helpers)

## Support

If you encounter any issues during migration:

1. Check the [Supabase Discord](https://discord.supabase.com)
2. Review the [GitHub Issues](https://github.com/supabase/supabase/issues)
3. Consult the [official documentation](https://supabase.com/docs)