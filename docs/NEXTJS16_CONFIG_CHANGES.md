# Next.js 16 Configuration Changes

## 🚨 Critical Changes in Next.js 16

### 1. **TypeScript Config Required**

Next.js 16 requires configuration files to be TypeScript:

```typescript
// ✅ next.config.ts (REQUIRED)
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // your config
}

export default nextConfig
```

```javascript
// ❌ next.config.js (NO LONGER SUPPORTED)
/** @type {import('next').NextConfig} */
const nextConfig = {}
module.exports = nextConfig
```

### 2. **Partial Prerendering (PPR) Configuration**

PPR configuration has moved from experimental to stable:

```typescript
// ❌ WRONG (Next.js 15 style)
export default {
  experimental: {
    ppr: 'incremental'
  }
}

// ✅ CORRECT (Next.js 16)
export default {
  cacheComponents: true
}
```

**Error you'll see if using old config:**
```
Error: `experimental.ppr` has been merged into `cacheComponents`. 
The Partial Prerendering feature is still available, but is now enabled via `cacheComponents`. 
Please update your next.config.js accordingly.
```

### 3. **Removed Experimental Flags**

These experimental flags are **now stable** and **enabled by default**:

#### React Compiler (Automatic)
```typescript
// ❌ REMOVE THIS
experimental: {
  reactCompiler: true  // No longer needed
}
```

**Error message:**
```
Unrecognized key(s) in object: 'reactCompiler' at "experimental"
```

The React Compiler is now **always enabled** in Next.js 16 with React 19. Your components are automatically optimized without any configuration.

#### Dynamic IO (Default)
```typescript
// ❌ REMOVE THIS
experimental: {
  dynamicIO: true  // No longer needed
}
```

**Error message:**
```
Unrecognized key(s) in object: 'dynamicIO' at "experimental"
```

Dynamic IO is now **enabled by default**. You can use `cookies()`, `headers()`, and other dynamic functions in async Server Components without any configuration.

#### after() Hook (Stable)
```typescript
// ❌ REMOVE THIS
experimental: {
  after: true  // No longer needed
}
```

**Error message:**
```
`experimental.after` is no longer needed, because `after` is available by default. 
You can remove it from next.config.js.
```

The `after()` hook is now **stable** and available by default:

```typescript
// Import without 'unstable_' prefix
import { after } from 'next/server'  // ✅ Stable API

export default async function Page() {
  after(() => {
    // Runs after response is sent
    logAnalytics()
  })
  
  return <div>Page</div>
}
```

### 4. **Complete Valid Configuration**

Here's a valid Next.js 16 configuration:

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable Partial Prerendering (was experimental.ppr)
  cacheComponents: true,
  
  // Standard configurations still work
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Headers configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
  
  // Rewrites configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/:path*',
      },
    ]
  },
  
  // Other standard options
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
}

export default nextConfig
```

## 📋 Migration Checklist

- [ ] Rename `next.config.js` to `next.config.ts`
- [ ] Change to TypeScript syntax with `NextConfig` type
- [ ] Replace `experimental.ppr` with `cacheComponents: true`
- [ ] Remove `experimental.reactCompiler` (now automatic)
- [ ] Remove `experimental.dynamicIO` (now default)
- [ ] Remove `experimental.after` (now stable)
- [ ] Update `after()` imports to remove `unstable_` prefix
- [ ] Test the application runs without errors

## 🔍 Common Errors and Solutions

### Error 1: Invalid Configuration Keys

```
Error: Unrecognized key(s) in object: 'reactCompiler', 'dynamicIO' at "experimental"
```

**Solution:** Remove these keys from your config - they're now automatic.

### Error 2: PPR Configuration

```
Error: `experimental.ppr` has been merged into `cacheComponents`
```

**Solution:** Replace `experimental: { ppr: 'incremental' }` with `cacheComponents: true`

### Error 3: After Hook

```
Warning: `experimental.after` is no longer needed
```

**Solution:** Remove from config and update imports:
```typescript
// Before
import { unstable_after as after } from 'next/server'

// After
import { after } from 'next/server'
```

### Error 4: TypeScript Configuration File

```
Error: Cannot find module './next.config.js'
```

**Solution:** Ensure you're using `next.config.ts` not `next.config.js`

## 🎯 What You Get Automatically

In Next.js 16, these features work **without any configuration**:

### 1. React Compiler
- ✅ Automatic memoization of components
- ✅ No need for `useMemo`, `useCallback`, `React.memo`
- ✅ Better performance out of the box

### 2. Dynamic IO
- ✅ Use `cookies()` in async Server Components
- ✅ Use `headers()` in async Server Components
- ✅ No "dynamic API used" warnings

### 3. after() Hook
- ✅ Run code after response is sent
- ✅ Perfect for analytics and logging
- ✅ Stable API (no more `unstable_` prefix)

### 4. Partial Prerendering
- ✅ Mix static and dynamic rendering
- ✅ Better performance
- ✅ Enable with single flag: `cacheComponents: true`

## 📚 Additional Resources

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/building-your-application/upgrading)
- [Next.js Configuration Options](https://nextjs.org/docs/app/api-reference/next-config-js)
- [React 19 Release Notes](https://react.dev/blog)

## ✅ Verification

After making changes, verify your config is correct:

```bash
# This should run without errors
npm run dev
# or
yarn dev

# Check for these success messages:
# ✓ Ready in X ms
# ✓ Compiled successfully
# ○ (Static) automatically rendered as static HTML
```

If you see configuration errors, refer to the error messages above and this guide.

---

**Remember: Next.js 16 requires TypeScript configuration and has moved experimental features to stable!** 🚀