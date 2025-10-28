import { apiClient } from './client'
import {
  Movie,
  MovieDetail,
  Category,
  Country,
  PaginatedResponse,
  SimpleListResponse,
  CursorPagination,
  Episode,
} from '@/types'

/**
 * Corrected Movie API implementation matching the actual API documentation
 * Base URL: https://cinevserse-api.nhatquang.shop
 * API Documentation: https://cinevserse-api.nhatquang.shop/api-json
 */

interface FilterParams {
  keyword?: string
  categories?: string[]
  countries?: string[]
  types?: string[]
  limit?: number
  lastView?: number
  lastCreatedAt?: string
  lastId?: string
  firstView?: number
  firstCreatedAt?: string
  firstId?: string
}

export const movieApiCorrected = {
  /**
   * Get all countries
   * GET /crawler/ophim/countries
   */
  getCountries: async (): Promise<Country[]> => {
    const response = await apiClient.get<Array<Country>>('/crawler/ophim/countries')
    return response || []
  },

  /**
   * Get all categories
   * GET /crawler/ophim/categories
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Array<Category>>('/crawler/ophim/categories')

    return response
  },

  /**
   * Get movie by slug
   * GET /crawler/ophim/info/{slug}
   */
  getMovieBySlug: async (slug: string): Promise<MovieDetail> => {
    return apiClient.get<MovieDetail>(`/crawler/ophim/info/${slug}`)
  },

  /**
   * Get episodes for a movie by slug
   * GET /crawler/ophim/info/{slug}/episodes
   */
  getEpisodesBySlug: async (slug: string): Promise<Episode[]> => {
    return apiClient.get<Episode[]>(`/crawler/ophim/info/${slug}/episodes`)
  },

  /**
   * Get hot/trending films
   * GET /crawler/ophim/hot
   */
  getHotFilms: async (limit = 20): Promise<PaginatedResponse<Movie>> => {
    return apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/hot', { limit })
  },

  /**
   * Search films by keyword
   * GET /crawler/ophim/search/{keyword}
   */
  searchFilms: async (keyword: string): Promise<PaginatedResponse<Movie>> => {
    return apiClient.get<PaginatedResponse<Movie>>(`/crawler/ophim/search/${keyword}`)
  },

  /**
   * Advanced filter films
   * POST /crawler/ophim/search
   */
  filterFilms: async (filters: FilterParams): Promise<PaginatedResponse<Movie>> => {
    return apiClient.post<PaginatedResponse<Movie>>('/crawler/ophim/search', filters)
  },

  /**
   * Get films by type with cursor pagination
   * GET /crawler/ophim/list-film-by-type
   * @param type - 'single', 'series', 'hoathinh', 'tvshows'
   */
  getFilmsByType: async (
    type: string,
    params?: {
      limit?: number
      lastView?: number
      lastCreatedAt?: string
      lastId?: string
      firstView?: number
      firstCreatedAt?: string
      firstId?: string
    }
  ): Promise<PaginatedResponse<Movie>> => {
    return apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/list-film-by-type', {
      type,
      ...params,
    })
  },

  /**
   * Get films by category with cursor pagination
   * GET /crawler/ophim/list-film-by-category
   */
  getFilmsByCategory: async (
    categorySlug: string,
    params?: {
      limit?: number
      lastView?: number
      lastCreatedAt?: string
      lastId?: string
      firstView?: number
      firstCreatedAt?: string
      firstId?: string
    }
  ): Promise<PaginatedResponse<Movie>> => {
    return apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/list-film-by-category', {
      category: categorySlug,
      ...params,
    })
  },

  /**
   * Get films by country with cursor pagination
   * GET /crawler/ophim/list-film-by-country
   */
  getFilmsByCountry: async (
    countrySlug: string,
    params?: {
      limit?: number
      lastView?: number
      lastCreatedAt?: string
      lastId?: string
      firstView?: number
      firstCreatedAt?: string
      firstId?: string
    }
  ): Promise<PaginatedResponse<Movie>> => {
    return apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/list-film-by-country', {
      country: countrySlug,
      ...params,
    })
  },

  /**
   * Get films by year with cursor pagination
   * GET /crawler/ophim/list-film-by-year
   */
  getFilmsByYear: async (
    year: number,
    params?: {
      limit?: number
      lastView?: number
      lastCreatedAt?: string
      lastId?: string
      firstView?: number
      firstCreatedAt?: string
      firstId?: string
    }
  ): Promise<PaginatedResponse<Movie>> => {
    return apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/list-film-by-year', {
      year,
      ...params,
    })
  },

  /**
   * Get films by actor with cursor pagination
   * GET /crawler/ophim/list-film-by-actor
   */
  getFilmsByActor: async (
    actor: string,
    params?: {
      limit?: number
      lastView?: number
      lastCreatedAt?: string
      lastId?: string
      firstView?: number
      firstCreatedAt?: string
      firstId?: string
    }
  ): Promise<PaginatedResponse<Movie>> => {
    return apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/list-film-by-actor', {
      actor,
      ...params,
    })
  },

  /**
   * Get films by director with cursor pagination
   * GET /crawler/ophim/list-film-by-director
   */
  getFilmsByDirector: async (
    director: string,
    params?: {
      limit?: number
      lastView?: number
      lastCreatedAt?: string
      lastId?: string
      firstView?: number
      firstCreatedAt?: string
      firstId?: string
    }
  ): Promise<PaginatedResponse<Movie>> => {
    return apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/list-film-by-director', {
      director,
      ...params,
    })
  },

  /**
   * Get specific episode by slug and episode number
   * GET /crawler/ophim/episode/{slug}
   */
  getEpisode: async (slug: string, episodeNumber: number, serverName?: string): Promise<any> => {
    return apiClient.get<any>(`/crawler/ophim/episode/${slug}`, {
      episodeNumber,
      ...(serverName && { serverName }),
    })
  },

  // Helper methods for common use cases

  /**
   * Get trending movies (alias for hot films)
   */
  getTrendingMovies: async (limit = 10): Promise<Movie[]> => {
    const response = await movieApiCorrected.getHotFilms(limit)
    return response.data
  },

  /**
   * Get new movies (series type)
   */
  getNewMovies: async (limit = 20): Promise<Movie[]> => {
    const response = await movieApiCorrected.getFilmsByType('series', { limit })
    return response.data
  },

  /**
   * Get cinema movies (chieurap = true)
   */
  getCinemaMovies: async (limit = 20): Promise<Movie[]> => {
    const response = await movieApiCorrected.filterFilms({
      limit,
    })
    // Filter for chieurap movies
    return response.data.filter((movie) => movie.chieurap)
  },

  /**
   * Get TV shows
   */
  getTVShows: async (limit = 20): Promise<Movie[]> => {
    const response = await movieApiCorrected.getFilmsByType('tvshows', { limit })
    return response.data
  },

  /**
   * Get anime/cartoons
   */
  getAnime: async (limit = 20): Promise<Movie[]> => {
    const response = await movieApiCorrected.getFilmsByType('hoathinh', { limit })
    return response.data
  },

  /**
   * Get single movies
   */
  getSingleMovies: async (limit = 20): Promise<Movie[]> => {
    const response = await movieApiCorrected.getFilmsByType('single', { limit })
    return response.data
  },

  /**
   * Get featured movies (high view count)
   */
  getFeaturedMovies: async (limit = 6): Promise<Movie[]> => {
    const response = await movieApiCorrected.getHotFilms(limit)
    return response.data
  },
}

export default movieApiCorrected
