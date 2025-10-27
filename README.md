# CineVerse - Movie Streaming Platform

A modern, responsive movie streaming website built with **Next.js 16** and **React 19.2**, featuring a comprehensive movie database, user authentication, and customizable UI.

## 🚀 Latest Updates

- ✅ **Upgraded to Next.js 16** with Incremental PPR and Dynamic IO
- ✅ **Upgraded to React 19.2** with React Compiler and new Hooks
- ✅ **Updated to @supabase/ssr** (replaced deprecated auth-helpers)
- ✅ **Complete API v2 Integration** with CineVerse API
- ✅ **Cursor-based Pagination** for better performance
- ✅ **Enhanced TypeScript** support with latest types

## ✨ Features

### 🎬 Core Features
- **Movie Streaming**: High-quality video playback with multiple sources
- **Comprehensive Database**: Extensive movie and TV show catalog
- **Advanced Search**: Smart search with filters and suggestions
- **User Authentication**: Secure login with multiple OAuth providers
- **Responsive Design**: Optimized for all devices and screen sizes

### 🎨 UI/UX Features
- **Customizable Layout**: User-configurable grid layouts (2x2, 3x3, list view)
- **Theme System**: Light/dark themes with custom color schemes
- **Drag & Drop**: Reorderable layout components
- **Smooth Animations**: Framer Motion powered transitions
- **Modern Components**: shadcn/ui component library

### 🚀 Performance
- **Progressive Web App**: Offline capabilities and app-like experience
- **Optimized Loading**: Image optimization and lazy loading
- **Smart Caching**: TanStack Query for intelligent data caching
- **Server Components**: Next.js 15 App Router with RSC

### 👥 User Features
- **Personal Profiles**: Customizable user profiles and preferences
- **Watch History**: Track viewing progress and history
- **Favorites**: Save and organize favorite movies
- **Recommendations**: Personalized movie suggestions

### 🛠 Admin Dashboard
- **Content Management**: Full CRUD operations for movies
- **User Management**: User analytics and management tools
- **Analytics**: Detailed usage statistics and insights
- **Moderation**: Content moderation and approval workflows

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router with Incremental PPR)
- **React**: React 19.2 with Compiler
- **Language**: TypeScript 5.7
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **Animation**: Framer Motion
- **Carousel**: Swiper
- **State Management**: TanStack Query

### Backend & Data
- **Authentication**: Supabase Auth with @supabase/ssr
- **Database**: Supabase PostgreSQL with Row-Level Security
- **API**: CineVerse API v2.0 (https://cinevserse-api.nhatquang.shop)
- **API Features**: Cursor-based pagination, Advanced filtering, MongoDB aggregation
- **File Storage**: Supabase Storage

### Development
- **Package Manager**: npm/yarn
- **Linting**: ESLint + Prettier
- **Type Checking**: TypeScript
- **Git Hooks**: Husky (optional)

## 🚀 Getting Started

> **Quick Start**: See [QUICK_START.md](./QUICK_START.md) for 5-minute setup guide!

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cineverse-streaming.git
   cd cineverse-streaming
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

   > **Note:** Next.js 16 requires `next.config.ts` (TypeScript). The project is already configured correctly.

3. **Environment Setup**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_BASE_URL=https://cinevserse-api.nhatquang.shop
   ```

4. **Database Setup**
   - Create a new Supabase project
   - Run the database migrations (schema provided in `/docs/database.sql`)
   - Set up authentication providers in Supabase dashboard

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open in Browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
cineverse-streaming/
├── app/                      # Next.js 15 App Router
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Admin dashboard
│   ├── (main)/              # Main application routes
│   ├── api/                 # API routes
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── ui/                  # Base UI components
│   ├── layout/              # Layout components
│   ├── auth/                # Authentication components
│   ├── movies/              # Movie-related components
│   └── admin/               # Admin components
├── lib/                     # Utilities and configurations
│   ├── api/                 # API client and services
│   ├── supabase/            # Supabase configuration
│   ├── utils.ts             # Utility functions
│   └── constants.ts         # App constants
├── hooks/                   # Custom React hooks
├── types/                   # TypeScript type definitions
├── public/                  # Static assets
└── docs/                    # Documentation
```

## 🎯 Key Components

### Movie Components
- **MovieCard**: Reusable movie display card
- **MovieGrid**: Responsive grid layout for movies
- **MovieCarousel**: Horizontal scrolling movie carousel
- **MoviePlayer**: Video player with controls

### Layout Components
- **Header**: Navigation with search and user menu
- **Footer**: Site footer with links and info
- **Sidebar**: Collapsible navigation sidebar

### Authentication
- **LoginForm**: User login with validation
- **RegisterForm**: User registration
- **UserMenu**: User account dropdown menu

## 🔧 Configuration

### Theme Customization
Edit `tailwind.config.ts` to customize colors, fonts, and spacing:

```typescript
theme: {
  extend: {
    colors: {
      primary: "hsl(var(--primary))",
      secondary: "hsl(var(--secondary))",
      // Add custom colors
    },
  },
}
```

### API Configuration
Configure API endpoints in `lib/constants.ts`:

```typescript
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  retryAttempts: 3,
}
```

## 📊 API Integration

The application integrates with the CineVerse API for movie data:

### Base URL
`https://cinevserse-api.nhatquang.shop`

### Key Endpoints
- `GET /v1/api/danh-sach/phim-moi-cap-nhat` - Latest movies
- `GET /v1/api/phim/{slug}` - Movie details
- `GET /v1/api/tim-kiem` - Search movies
- `GET /v1/api/the-loai` - Categories
- `GET /v1/api/quoc-gia` - Countries

## 🎨 Styling Guide

### CSS Classes
- `.movie-card` - Movie card styling
- `.hero-gradient` - Hero section gradient
- `.glass` - Glass morphism effect
- `.custom-scrollbar` - Custom scrollbar styling

### Component Variants
Components use class-variance-authority for consistent variants:

```typescript
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        outline: "outline-classes",
      },
      size: {
        sm: "small-classes",
        lg: "large-classes",
      },
    },
  }
)
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Other Platforms
The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- Self-hosted with Docker

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e
```

## 📈 Performance Optimization

### Image Optimization
- Next.js Image component with automatic optimization
- WebP/AVIF format support
- Lazy loading by default

### Caching Strategy
- TanStack Query for API response caching
- Next.js static generation where possible
- CDN caching for static assets

### Bundle Optimization
- Code splitting with dynamic imports
- Tree shaking for unused code
- Compression and minification

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Supabase](https://supabase.com/) - Backend as a service
- [TanStack Query](https://tanstack.com/query) - Data fetching library
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 📞 Support

For support, email support@cineverse.com or join our Discord community.

---

Built with ❤️ by the CineVerse Team