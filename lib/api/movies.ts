/**
 * DEPRECATED: This file uses old API endpoints that don't match the actual API
 * Please use lib/api/movies-corrected.ts instead
 * 
 * This file is kept for backward compatibility but will be removed in the future
 */

import { apiClient } from './client'
import { 
  Movie, 
  MovieDetail, 
  Category, 
  Country, 
  ApiResponse, 
  PaginatedResponse,
  SearchFilters 
} from '@/types'

// Import the corrected API
import movieApiCorrected from './movies-corrected'

/**
 * @deprecated Use movieApiCorrected from './movies-corrected' instead
 */
export const movieApi = {
  // Get all movies with pagination and filters
  getMovies: async (filters: SearchFilters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 20,
      category: filters.category?.join(','),
      country: filters.country?.join(','),
      year: filters.year,
      type: filters.type,
      status: filters.status,
      quality: filters.quality,
      sortField: filters.sortBy || 'modified',
      sortType: filters.sortOrder || 'desc'
    }

    return apiClient.get<ApiResponse<PaginatedResponse<Movie>>>('/v1/api/danh-sach/phim-moi-cap-nhat', params)
  },

  // Get movie by slug
  getMovieBySlug: async (slug: string) => {
    return apiClient.get<ApiResponse<MovieDetail>>(`/v1/api/phim/${slug}`)
  },

  // Search movies
  searchMovies: async (query: string, filters: SearchFilters = {}) => {
    const params = {
      keyword: query,
      page: filters.page || 1,
      limit: filters.limit || 20
    }

    return apiClient.get<ApiResponse<PaginatedResponse<Movie>>>('/v1/api/tim-kiem', params)
  },

  // Get trending movies
  getTrendingMovies: async (limit = 10) => {
    return apiClient.get<ApiResponse<PaginatedResponse<Movie>>>('/v1/api/danh-sach/phim-hot', {
      limit
    })
  },

  // Get new movies
  getNewMovies: async (limit = 10) => {
    return apiClient.get<ApiResponse<PaginatedResponse<Movie>>>('/v1/api/danh-sach/phim-moi', {
      limit
    })
  },

  // Get movies by category
  getMoviesByCategory: async (categorySlug: string, filters: SearchFilters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 20,
      sortField: filters.sortBy || 'modified',
      sortType: filters.sortOrder || 'desc'
    }

    return apiClient.get<ApiResponse<PaginatedResponse<Movie>>>(`/v1/api/the-loai/${categorySlug}`, params)
  },

  // Get movies by country
  getMoviesByCountry: async (countrySlug: string, filters: SearchFilters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 20,
      sortField: filters.sortBy || 'modified',
      sortType: filters.sortOrder || 'desc'
    }

    return apiClient.get<ApiResponse<PaginatedResponse<Movie>>>(`/v1/api/quoc-gia/${countrySlug}`, params)
  },

  // Get categories
  getCategories: async () => {
    return apiClient.get<ApiResponse<Category[]>>('/v1/api/the-loai')
  },

  // Get countries
  getCountries: async () => {
    return apiClient.get<ApiResponse<Country[]>>('/v1/api/quoc-gia')
  },

  // Get featured movies for homepage
  getFeaturedMovies: async () => {
    return apiClient.get<ApiResponse<PaginatedResponse<Movie>>>('/v1/api/danh-sach/phim-de-cu', {
      limit: 6
    })
  },

  // Get cinema movies
  getCinemaMovies: async (filters: SearchFilters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 20
    }

    return apiClient.get<ApiResponse<PaginatedResponse<Movie>>>('/v1/api/danh-sach/phim-chieu-rap', params)
  },

  // Get TV shows
  getTVShows: async (filters: SearchFilters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 20
    }

    return apiClient.get<ApiResponse<PaginatedResponse<Movie>>>('/v1/api/danh-sach/tv-shows', params)
  },

  // Get anime/cartoons
  getAnime: async (filters: SearchFilters = {}) => {
    const params = {
      page: filters.page || 1,
      limit: filters.limit || 20
    }

    return apiClient.get<ApiResponse<PaginatedResponse<Movie>>>('/v1/api/danh-sach/hoat-hinh', params)
  }
}