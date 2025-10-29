You are a senior Next.js developer tasked with building a comprehensive movie streaming website. Create a complete implementation plan and code structure using the latest Next.js 15.5.6/16.0.0/latest version(16.0.1), Reactjs 19.2 (latest version) with modern architecture patterns.
Using typescript latest version with type safety, full type support for every type and data,...

## Project Requirements

API Integration:

Base API: https://cinevserse-api.nhatquang.shop
API doc swagger json: https://cinevserse-api.nhatquang.shop/api-json
Implement all available endpoints for movie data fetching
Authentication System:

Integrate Supabase authentication
Support multiple providers: Google, Facebook, TikTok, Twitter
Implement secure login/logout flows with proper session management
UI/UX Features:

Customizable User Interface:
User-configurable grid layouts (2x2, 3x3, list view, etc.)
Dynamic color theme switching (light/dark/custom themes)
Drag-and-drop layout reordering
Design System:
shadcn/ui components
Tailwind CSS v4 (not tailwindcss.config.ts provided)
Framer Motion for animations and transitions so moothy
Swiper for carousels and sliders
Core Pages & Features:

Home page with featured content and recommendations
Blog section with movie news and reviews
Country/Category listing pages with filtering
Movie listings by country/category with pagination
Hot/trending movies section
Cinema listings and showtimes
Detailed movie information pages
Video player page with streaming capabilities
User profile and settings pages
Performance & Caching:

Progressive Web App (PWA) implementation
Service Worker for offline caching
TanStack Query for API calls and intelligent caching
Server-side state management
Image optimization and lazy loading
Admin Dashboard:

Complete CRUD operations for movies
User management and analytics
Content moderation tools
Access tracking and user behavior analytics
Role-based permissions system

## Technical Specifications

Architecture Requirements:

Use Next.js 15.5.6/16.0.0/latest version(16.0.1) App Router with TypeScript
Implement proper folder structure following Next.js conventions
Server Components and Client Components separation
API routes for backend functionality
Middleware for authentication and route protection (if use version >=16.0.0 will be use proxy.ts instead)
Code Quality Standards:

Follow Next.js best practices and conventions
Implement proper error handling and loading states
Use React Server Components where appropriate
Optimize for Core Web Vitals
Include comprehensive TypeScript types
Deliverables Expected:

Complete project structure with all necessary files
Implementation of all core features mentioned above
Responsive design that works on all devices
Production-ready code with proper error handling
Documentation for setup and deployment
Provide a detailed implementation plan including file structure, key components, API integration patterns, and code examples for the most critical features. Focus on scalability, performance, and maintainability.
Expand with features like a recommendation system, social features, payment integration, and advanced analytics

- Collaborative Filtering works on the principle that users with similar past behavior will have similar future interests. We will implement both User-Based (based on similar users) and Item-Based (based on similar movies).
- Our proposed system will consist of three main components: Data Collection Layer (collecting user interaction data), Model Training Pipeline (training ML models), and Inference API (serving real-time recommendations)
- Content-Based Filtering recommends movies based on content characteristics (genre, director, actors, plot) similar to what the user already likes. This method works well for new users and can clearly explain the reasons for recommendations.
- Hybrid Recommendation System: Hybrid systems combine the advantages of both Collaborative and Content-Based Filtering to achieve higher accuracy. We can use either weighted hybrid or switching hybrid depending on the context.
- Real-time Comments with WebSocket: To create a real-time interactive experience, we use WebSocket for comments and reactions. Supabase provides Realtime subscriptions that make this simple.
- Activity Feed System: Activity feed shows the activities of people you follow, creates engagements, and discovers new content.
- Video Player with Analytics Tracking, Real-time Analytics Dashboard, Redis Caching Strategy
