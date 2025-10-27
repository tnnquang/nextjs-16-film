export const APP_CONFIG = {
  name: 'CineVerse',
  description: 'Your ultimate movie streaming destination',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og-image.jpg',
  links: {
    github: 'https://github.com/yourusername/cineverse',
    twitter: 'https://twitter.com/cineverse'
  }
} as const

export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://cinevserse-api.nhatquang.shop',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000
} as const

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
} as const

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/profile',
  MOVIES: '/movies',
  MOVIE_DETAIL: '/movies/[slug]',
  WATCH: '/watch/[slug]',
  CATEGORIES: '/categories',
  COUNTRIES: '/countries',
  BLOG: '/blog',
  SEARCH: '/search',
  ADMIN: '/admin',
  ADMIN_MOVIES: '/admin/movies',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics'
} as const

export const MOVIE_TYPES = {
  SINGLE: 'single',
  SERIES: 'series',
  ANIME: 'hoathinh',
  TV_SHOWS: 'tvshows'
} as const

export const MOVIE_STATUS = {
  COMPLETED: 'completed',
  ONGOING: 'ongoing',
  TRAILER: 'trailer'
} as const

export const QUALITY_OPTIONS = {
  AUTO: 'auto',
  HD: 'hd',
  SD: 'sd',
  FHD: 'fhd',
  '4K': '4k'
} as const

export const LAYOUT_TYPES = {
  GRID_2X2: 'grid-2x2',
  GRID_3X3: 'grid-3x3',
  GRID_4X4: 'grid-4x4',
  LIST: 'list'
} as const

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const

export const SORT_OPTIONS = {
  NAME: 'name',
  YEAR: 'year',
  CREATED: 'created',
  MODIFIED: 'modified',
  VIEW: 'view',
  RATING: 'rating'
} as const

export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc'
} as const

export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  maxLimit: 100
} as const

export const CACHE_KEYS = {
  MOVIES: 'movies',
  MOVIE_DETAIL: 'movie-detail',
  CATEGORIES: 'categories',
  COUNTRIES: 'countries',
  USER_PROFILE: 'user-profile',
  USER_PREFERENCES: 'user-preferences',
  TRENDING: 'trending',
  RECOMMENDATIONS: 'recommendations'
} as const

export const CACHE_TIME = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000 // 24 hours
} as const

export const BREAKPOINTS = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth-token',
  USER_PREFERENCES: 'user-preferences',
  THEME: 'theme',
  LAYOUT: 'layout',
  WATCH_HISTORY: 'watch-history',
  FAVORITES: 'favorites'
} as const

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to log in to access this feature.',
  FORBIDDEN: 'You don\'t have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  RATE_LIMIT: 'Too many requests. Please try again later.'
} as const

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in!',
  LOGOUT_SUCCESS: 'Successfully logged out!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PREFERENCES_SAVED: 'Preferences saved successfully!',
  MOVIE_ADDED_TO_FAVORITES: 'Movie added to favorites!',
  MOVIE_REMOVED_FROM_FAVORITES: 'Movie removed from favorites!'
} as const

export const OAUTH_PROVIDERS = [
  {
    id: 'google',
    name: 'Google',
    icon: 'google'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook'
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'twitter'
  }
] as const

export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  EDITOR: 'editor'
} as const

export const USER_ROLES = {
  USER: 'user',
  PREMIUM: 'premium',
  VIP: 'vip'
} as const