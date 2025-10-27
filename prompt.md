You are a senior Next.js developer tasked with building a comprehensive movie streaming website. Create a complete implementation plan and code structure using the latest Next.js 15 with modern architecture patterns.

## Project Requirements

API Integration:

Base API: https://cinevserse-api.nhatquang.shop
API doc swagger: https://cinevserse-api.nhatquang.shop/api#/Ophim%20Crawler
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
Tailwind CSS v4
Framer Motion for animations and transitions
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

Use Next.js 15 App Router with TypeScript
Implement proper folder structure following Next.js conventions
Server Components and Client Components separation
API routes for backend functionality
Middleware for authentication and route protection
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
