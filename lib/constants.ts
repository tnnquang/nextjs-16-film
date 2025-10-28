/**
 * Application Constants
 * Centralized configuration for the entire application
 */

// Application Info
export const APP_NAME = 'Cineverse'
export const APP_DESCRIPTION = 'Your Ultimate Movie Streaming Platform'
export const APP_URL = 'https://cineverse.nhatquang.shop'

// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'https://cinevserse-api.nhatquang.shop',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
}

// Theme Configuration
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const

export const DEFAULT_THEME = THEME_MODES.DARK

// Pagination
export const DEFAULT_PAGE_SIZE = 20
export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 50, 100]

// Movie Types
export const MOVIE_TYPES = {
  SINGLE: 'single',
  SERIES: 'series',
  ANIME: 'hoathinh',
  TV_SHOWS: 'tvshows',
} as const

export const MOVIE_TYPE_LABELS = {
  [MOVIE_TYPES.SINGLE]: 'Phim Lẻ',
  [MOVIE_TYPES.SERIES]: 'Phim Bộ',
  [MOVIE_TYPES.ANIME]: 'Hoạt Hình',
  [MOVIE_TYPES.TV_SHOWS]: 'TV Shows',
} as const

// Movie Status
export const MOVIE_STATUS = {
  COMPLETED: 'completed',
  ONGOING: 'ongoing',
  TRAILER: 'trailer',
} as const

export const MOVIE_STATUS_LABELS = {
  [MOVIE_STATUS.COMPLETED]: 'Hoàn Thành',
  [MOVIE_STATUS.ONGOING]: 'Đang Chiếu',
  [MOVIE_STATUS.TRAILER]: 'Trailer',
} as const

// Quality Options
export const QUALITY_OPTIONS = ['HD', 'FHD', 'CAM', 'SD', '4K', 'TRAILER'] as const

// Routes
export const ROUTES = {
  HOME: '/',
  MOVIES: '/movies',
  MOVIE_DETAIL: (slug: string) => `/movies/${slug}`,
  WATCH: (slug: string) => `/watch/${slug}`,
  CATEGORIES: '/categories',
  CATEGORY_DETAIL: (slug: string) => `/categories/${slug}`,
  COUNTRIES: '/countries',
  COUNTRY_DETAIL: (slug: string) => `/countries/${slug}`,
  SEARCH: '/search',
  BLOG: '/blog',
  BLOG_POST: (slug: string) => `/blog/${slug}`,
  PROFILE: '/profile',
  FAVORITES: '/profile/favorites',
  WATCH_HISTORY: '/profile/history',
  WATCH_LATER: '/profile/watch-later',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN: '/admin',
} as const

// Image Placeholders
export const PLACEHOLDER_IMAGE = '/placeholder-movie.jpg'
export const PLACEHOLDER_AVATAR = '/placeholder-avatar.jpg'

// Social Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/cineverse',
  TWITTER: 'https://twitter.com/cineverse',
  INSTAGRAM: 'https://instagram.com/cineverse',
  YOUTUBE: 'https://youtube.com/@cineverse',
} as const

// SEO
export const DEFAULT_SEO = {
  title: `${APP_NAME} - ${APP_DESCRIPTION}`,
  description:
    'Xem phim online chất lượng cao miễn phí. Phim mới, phim hot, phim chiếu rạp cập nhật liên tục.',
  keywords: [
    'xem phim online',
    'phim mới',
    'phim hay',
    'phim chiếu rạp',
    'phim bộ',
    'phim lẻ',
    'hoạt hình',
    'anime',
  ] as string[],
  ogImage: '/og-image.jpg',
} as const

// Footer Links
export const FOOTER_LINKS = {
  ABOUT: '/about',
  CONTACT: '/contact',
  TERMS: '/terms',
  PRIVACY: '/privacy',
  DMCA: '/dmca',
} as const

// Cache TTL (in milliseconds)
export const CACHE_TTL = {
  MOVIE_DETAIL: 5 * 60 * 1000, // 5 minutes
  MOVIE_LIST: 2 * 60 * 1000, // 2 minutes
  CATEGORIES: 60 * 60 * 1000, // 1 hour
  COUNTRIES: 60 * 60 * 1000, // 1 hour
  SEARCH: 30 * 1000, // 30 seconds
} as const

// Video Player
export const VIDEO_PLAYER_CONFIG = {
  autoplay: false,
  controls: true,
  fluid: true,
  preload: 'metadata',
} as const

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Đã có lỗi xảy ra. Vui lòng thử lại sau.',
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  NOT_FOUND: 'Không tìm thấy nội dung.',
  UNAUTHORIZED: 'Bạn cần đăng nhập để tiếp tục.',
  FORBIDDEN: 'Bạn không có quyền truy cập.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  RATE_LIMIT: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Đã lưu thành công!',
  UPDATED: 'Đã cập nhật thành công!',
  DELETED: 'Đã xóa thành công!',
  COPIED: 'Đã sao chép!',
} as const

// Responsive Breakpoints (matches Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

// Animation Durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
} as const

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
}

export type MovieType = (typeof MOVIE_TYPES)[keyof typeof MOVIE_TYPES]
export type MovieStatus = (typeof MOVIE_STATUS)[keyof typeof MOVIE_STATUS]
export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES]
