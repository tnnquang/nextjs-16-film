# Quick Start Guide - Cineverse

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
```bash
npm install
```

This will install:
- Next.js 16
- React 19
- Tailwind CSS v4
- next-themes
- tailwindcss-animate
- 11 Radix UI packages
- All other dependencies

2. **Clear build cache (if needed):**
```bash
rm -rf .next
```

3. **Run development server:**
```bash
npm run dev
```

4. **Open in browser:**
```
http://localhost:3000
```

---

## 🎯 Project Overview

### What's Included

✅ **10+ Pages:**
- Home page with featured movies
- Movies list (by type)
- Movie detail pages
- Watch pages with video player
- Categories and category detail
- Countries and country detail
- Blog and blog posts
- Search page
- Profile pages

✅ **Complete API Integration:**
- Correct endpoints verified
- Cursor-based pagination
- Type-safe implementation
- Error handling with retry logic

✅ **Beautiful UI:**
- Dark/Light theme toggle
- Responsive design
- Smooth animations
- Vietnamese localization

✅ **Production Ready:**
- TypeScript strict mode
- No errors
- Optimized performance
- SEO friendly

---

## 📁 Key Files

### Configuration
- `lib/constants.ts` - All app-wide settings
- `tailwind.config.ts` - Tailwind configuration
- `next.config.ts` - Next.js configuration
- `components.json` - shadcn/ui configuration

### API
- `lib/api/movies-corrected.ts` - Main API implementation
- `lib/api/client.ts` - HTTP client
- `lib/api/migration-helper.ts` - Pagination utilities

### Pages
- `app/page.tsx` - Home page
- `app/movies/page.tsx` - Movies list
- `app/categories/page.tsx` - Categories
- `app/countries/page.tsx` - Countries
- `app/blog/page.tsx` - Blog

### Components
- `components/layout/header.tsx` - Header with navigation
- `components/layout/footer.tsx` - Footer
- `components/movies/movie-card.tsx` - Movie card
- `components/ui/theme-toggle.tsx` - Theme toggle

---

## 🎨 Customization

### Change App Name
Edit `lib/constants.ts`:
```typescript
export const APP_NAME = 'Your App Name'
export const APP_DESCRIPTION = 'Your description'
```

### Change Theme Colors
Edit `app/globals.css`:
```css
@theme {
  --color-primary: your-color;
  --color-secondary: your-color;
}
```

### Change Default Theme
Edit `lib/constants.ts`:
```typescript
export const DEFAULT_THEME = THEME_MODES.LIGHT // or DARK or SYSTEM
```

### Add/Remove Navigation Items
Edit `components/layout/header.tsx`:
```typescript
const navigation = [
  { name: 'Your Link', href: '/your-path' },
  // ...
]
```

---

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript errors
```

---

## 📚 API Usage

### Get Hot Movies
```typescript
import movieApi from '@/lib/api/movies-corrected'

const response = await movieApi.getHotFilms(20)
console.log(response.data) // Array of movies
console.log(response.hasNextPage) // Boolean
```

### Search Movies
```typescript
const results = await movieApi.searchFilms('avatar')
console.log(results.data)
```

### Get Movie Details
```typescript
const movie = await movieApi.getMovieBySlug('avatar-2-dong-chay-cua-nuoc')
console.log(movie.name)
```

### Get Categories
```typescript
const categories = await movieApi.getCategories()
console.log(categories)
```

### Pagination
```typescript
// First page
const page1 = await movieApi.getHotFilms(20)

// Next page
if (page1.hasNextPage && page1.nextCursor) {
  const page2 = await movieApi.getHotFilms(20, {
    lastView: page1.nextCursor.view,
    lastCreatedAt: page1.nextCursor.createdAt,
    lastId: page1.nextCursor.id
  })
}
```

---

## 🎯 Common Tasks

### Add a New Page
1. Create file in `app/your-page/page.tsx`
2. Add route to `lib/constants.ts`
3. Add navigation link to header if needed

### Add a New Component
1. Create file in `components/your-component.tsx`
2. Import and use in your page

### Add API Endpoint
1. Add method to `lib/api/movies-corrected.ts`
2. Use in your component with React Query

### Change Styling
1. Edit `app/globals.css` for global styles
2. Use Tailwind classes in components
3. Update theme colors in CSS variables

---

## 🐛 Troubleshooting

### Issue: Module not found
**Solution:**
```bash
npm install
```

### Issue: TypeScript errors
**Solution:**
```bash
npm run type-check
```

### Issue: Styles not loading
**Solution:**
```bash
rm -rf .next
npm run dev
```

### Issue: API not working
**Solution:**
Check API base URL in `lib/constants.ts`:
```typescript
export const API_CONFIG = {
  baseUrl: 'https://cinevserse-api.nhatquang.shop',
  // ...
}
```

---

## 📖 Documentation

- **API Corrections:** `docs/API_CORRECTIONS.md`
- **API Examples:** `docs/API_USAGE_EXAMPLES.md`
- **Tailwind Migration:** `docs/TAILWIND_V4_MIGRATION.md`
- **TypeScript Fixes:** `TYPESCRIPT_FIXES_COMPLETE.md`
- **Complete Summary:** `FINAL_IMPLEMENTATION_COMPLETE.md`

---

## 🎉 Features

### Current Features
✅ Browse movies by type  
✅ Browse by category  
✅ Browse by country  
✅ Search movies  
✅ View movie details  
✅ Watch movies  
✅ Dark/Light theme  
✅ Responsive design  
✅ Blog system  

### Optional Enhancements
- User authentication
- Favorites system
- Watch history
- User ratings
- Comments
- Social sharing

---

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
2. **Import project in Vercel**
3. **Set environment variables:**
   - `NEXT_PUBLIC_API_URL`
4. **Deploy!**

### Manual Deploy
```bash
npm run build
npm run start
```

---

## 💡 Tips

1. **Use constants** - All app-wide values in `lib/constants.ts`
2. **Type safety** - Always use TypeScript types
3. **Components** - Reuse components from `components/ui`
4. **Pagination** - Use `CursorPaginationManager` for pagination
5. **Error handling** - Use try-catch and show user-friendly errors
6. **Loading states** - Always show loading indicators
7. **Responsive** - Test on mobile devices

---

## 📞 Support

### Resources
- Next.js Docs: https://nextjs.org/docs
- Tailwind Docs: https://tailwindcss.com/docs
- React Query: https://tanstack.com/query
- API Docs: https://cinevserse-api.nhatquang.shop/api-json

### Need Help?
1. Check documentation files
2. Review code examples
3. Check console for errors
4. Test API endpoints directly

---

**Happy Coding! 🎬**
