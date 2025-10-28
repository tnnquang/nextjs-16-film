// Core movie types based on API structure
export interface Movie {
  _id: string
  id?: string
  name: string
  slug: string
  origin_name: string
  poster_url: string
  thumb_url: string
  year: number
  category: Category[]
  country: Country[]
  type: 'single' | 'series' | 'hoathinh' | 'tvshows'
  status: 'completed' | 'ongoing' | 'trailer'
  chieurap: boolean
  time: string
  episode_current: string
  episode_total: string
  quality: string
  lang: string
  notify: string
  showtimes: string
  trailer_url: string
  content: string
  actor: string[]
  director: string[]
  created: {
    time: string
  }
  modified: {
    time: string
  }
  view: number
  sub_docquyen: boolean
  is_copyright: boolean
  imdb: {
    id: string
    vote_average: number
    vote_count: number
  }
  tmdb: {
    type: string | null
    id: string
    season: number | null
    vote_average: number
    vote_count: number
  }
  createdAt: string
  updatedAt: string
  deleted?: boolean
  isPublic?: boolean
  keywords?: string[]
  __v?: number
}

export interface MovieDetail extends Movie {
  episodes: Episode[]
}

export interface Episode {
  server_name: string
  server_data: EpisodeData[]
}

export interface EpisodeData {
  name: string
  slug: string
  filename: string
  link_embed: string
  link_m3u8: string
}

export interface Category {
  _id: string
  id?: string
  name: string
  slug: string
  icon?: string
  tags?: string[]
  deleted?: boolean
  createdAt?: string
  updatedAt?: string
  __v?: number
}

export interface Country {
  _id: string
  id?: string
  name: string
  slug: string | null
  flagLogo?: string
  tags?: string[]
  deleted?: boolean
  createdAt?: string
  updatedAt?: string
  __v?: number
}

// API Response types
export interface ApiResponse<T> {
  status: boolean
  msg: string
  data: T
}

// Cursor for pagination
export interface CursorPagination {
  view?: number
  createdAt?: string
  id?: string
}

// API response with cursor-based pagination
export interface PaginatedResponse<T> {
  data: T[]
  nextCursor: CursorPagination | null
  prevCursor: CursorPagination | null
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

// Response for countries and categories (simple array)
export interface SimpleListResponse<T> {
  value: T[]
  Count: number
}

// User and Authentication types
export interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    avatar_url?: string
    provider?: string
  }
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  preferences: UserPreferences
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  layout: 'grid-2x2' | 'grid-3x3' | 'grid-4x4' | 'list'
  autoplay: boolean
  quality: 'auto' | 'hd' | 'sd'
  notifications: {
    email: boolean
    push: boolean
    new_movies: boolean
    recommendations: boolean
  }
}

// UI and Layout types
export interface LayoutConfig {
  id: string
  name: string
  columns: number
  rows: number
  components: LayoutComponent[]
}

export interface LayoutComponent {
  id: string
  type: 'hero' | 'carousel' | 'grid' | 'list' | 'featured'
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  props: Record<string, any>
}

export interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
    muted: string
    border: string
  }
  fonts: {
    heading: string
    body: string
  }
}

// Search and Filter types
export interface SearchFilters {
  query?: string
  category?: string[]
  country?: string[]
  year?: string
  type?: string
  status?: string
  quality?: string
  sortBy?: 'name' | 'year' | 'created' | 'modified' | 'view'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface SearchResult {
  movies: Movie[]
  totalPages: number
  currentPage: number
  totalItems: number
  filters: SearchFilters
}

// Blog types
export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  categories: string[]
  tags: string[]
  published_at: string
  updated_at: string
  status: 'draft' | 'published'
}

// Admin types
export interface AdminStats {
  totalMovies: number
  totalUsers: number
  totalViews: number
  newMoviesToday: number
  newUsersToday: number
  popularMovies: Movie[]
  recentActivity: ActivityLog[]
}

export interface ActivityLog {
  id: string
  action: string
  resource: string
  user_id: string
  user_name: string
  timestamp: string
  details?: Record<string, any>
}

// PWA and Service Worker types
export interface PWAUpdateInfo {
  available: boolean
  waiting: ServiceWorker | null
}

// Form types
export interface LoginForm {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  agreeToTerms: boolean
}

export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}