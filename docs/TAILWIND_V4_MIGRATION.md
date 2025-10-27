# Tailwind CSS v4 Migration Guide

This document outlines the changes made to migrate from Tailwind CSS v3 to v4.

## Changes Made

### 1. Package Updates

**Updated dependencies in `package.json`:**
- ✅ Upgraded `tailwindcss` from `^3.3.0` to `^4.0.0`
- ✅ Added `next-themes` `^0.2.1` (for dark mode support)
- ✅ Added `tailwindcss-animate` `^1.0.7` (for animations)

### 2. PostCSS Configuration

**Updated `postcss.config.js`:**
```javascript
// Before (v3)
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// After (v4)
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### 3. Tailwind Configuration

**Simplified `tailwind.config.ts`:**
- Removed `darkMode` configuration (now handled in CSS)
- Removed theme extensions (moved to CSS with `@theme`)
- Removed plugins (moved to CSS with `@plugin`)
- Kept only `content` paths and minimal config

### 4. CSS File Structure

**Updated `app/globals.css`:**

#### Import Statement
```css
/* Before (v3) */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* After (v4) */
@import "tailwindcss";
@plugin "tailwindcss-animate";
```

#### Theme Variables
```css
/* v4 uses @theme directive with --color-* prefix */
@theme {
  --color-background: 0 0% 100%;
  --color-foreground: 222.2 84% 4.9%;
  /* ... other colors */
  
  --radius-lg: 0.75rem;
  --radius-md: calc(0.75rem - 2px);
  --radius-sm: calc(0.75rem - 4px);
  
  --animate-accordion-down: accordion-down 0.2s ease-out;
  /* ... other animations */
}
```

#### Dark Mode
```css
/* v4 uses color-scheme for dark mode */
@layer base {
  :root {
    color-scheme: light;
  }

  .dark {
    color-scheme: dark;
    --color-background: 222.2 84% 4.9%;
    /* ... dark mode colors */
  }
}
```

#### CSS Properties
- Changed from `@apply` utilities to standard CSS where appropriate
- Updated color references from `hsl(var(--background))` to `hsl(var(--color-background))`
- Converted utility-heavy components to plain CSS for better performance

### 5. Shadcn/ui Configuration

**Created `components.json`:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

## Key Differences in v4

### 1. CSS-First Configuration
- Most configuration now lives in CSS using `@theme` directive
- JavaScript config is minimal and mainly for content paths

### 2. New Color Variable Naming
- Prefix changed from `--` to `--color-` for theme colors
- Example: `--background` → `--color-background`

### 3. Plugin System
- Plugins now loaded via `@plugin` directive in CSS
- Example: `@plugin "tailwindcss-animate";`

### 4. Dark Mode
- Now uses `color-scheme` property
- Still supports class-based dark mode with `.dark` class

### 5. Performance Improvements
- Reduced `@apply` usage for better build performance
- Native CSS properties where appropriate

## Installation Steps

To apply these changes to a new environment:

1. Install dependencies:
```bash
npm install
```

2. The following packages should be installed:
   - `tailwindcss@^4.0.0`
   - `next-themes@^0.2.1`
   - `tailwindcss-animate@^1.0.7`

3. Verify configuration files:
   - `postcss.config.js` - PostCSS v4 plugin
   - `tailwind.config.ts` - Minimal config
   - `app/globals.css` - CSS-based theme configuration
   - `components.json` - Shadcn/ui settings

4. Test the application:
```bash
npm run dev
```

## Using Theme Colors in Components

When using theme colors in your components, reference them with the new naming:

```tsx
// In your components
<div className="bg-background text-foreground">
  {/* Tailwind v4 will resolve these to hsl(var(--color-background)) */}
</div>

// Or in custom CSS
.my-class {
  background-color: hsl(var(--color-background));
  color: hsl(var(--color-foreground));
}
```

## Troubleshooting

### If styles don't load:
1. Clear `.next` cache: `rm -rf .next`
2. Reinstall dependencies: `npm install`
3. Restart dev server: `npm run dev`

### If colors look wrong:
- Check that color variables use `--color-` prefix in CSS
- Verify `@theme` directive is before `@layer` directives

### If animations don't work:
- Ensure `@plugin "tailwindcss-animate";` is in globals.css
- Verify keyframes are defined in CSS
- Check animation names in `@theme` section

## Benefits of v4

1. **Faster builds** - Less JavaScript, more native CSS
2. **Better performance** - Optimized PostCSS plugin
3. **Cleaner config** - Most configuration in CSS
4. **Modern standards** - Uses latest CSS features
5. **Improved DX** - Better error messages and warnings

## References

- [Tailwind CSS v4 Official Docs](https://tailwindcss.com/docs)
- [Tailwind CSS v4 Migration Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Next.js with Tailwind v4](https://nextjs.org/docs/app/building-your-application/styling/tailwind-css)
