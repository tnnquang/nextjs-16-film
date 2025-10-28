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
    const [response, error] = await apiClient.get<Array<Country>>('/crawler/ophim/countries')
    if (error) {
      console.error(error)
      return []
    }
    return response || []
  },

  /**
   * Get all categories
   * GET /crawler/ophim/categories
   */
  getCategories: async (): Promise<Category[]> => {
    const [response, error] = await apiClient.get<Array<Category>>('/crawler/ophim/categories')
    if (error) {
      console.error(error)
      return []
    }
    return response || []
  },

  getMovieBySlug: async (slug: string): Promise<MovieDetail | null> => {
    const [response, error] = await apiClient.get<MovieDetail>(`/crawler/ophim/info/${slug}`)
    if (error) {
      console.error(error)
      return null
    }
    return response
  },

  getEpisodesBySlug: async (slug: string): Promise<Episode[]> => {
    const [response, error] = await apiClient.get<Episode[]>(`/crawler/ophim/info/${slug}/episodes`)
    if (error) {
      console.error(error)
      return []
    }
    return response || []
  },

  getHotFilms: async (limit = 20): Promise<PaginatedResponse<Movie>> => {
    const [response, error] = await apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/hot', { limit })
    if (error) {
      console.error(error)
      return { data: [], total: 0, hasMore: false }
    }
    return response || { data: [], total: 0, hasMore: false }
  },

  searchFilms: async (keyword: string): Promise<PaginatedResponse<Movie>> => {
    const [response, error] = await apiClient.get<PaginatedResponse<Movie>>(`/crawler/ophim/search/${keyword}`)
    if (error) {
      console.error(error)
      return { data: [], total: 0, hasMore: false }
    }
    return response || { data: [], total: 0, hasMore: false }
  },

  filterFilms: async (filters: FilterParams): Promise<PaginatedResponse<Movie>> => {
    const [response, error] = await apiClient.post<PaginatedResponse<Movie>>('/crawler/ophim/search', filters)
    if (error) {
      console.error(error)
      return { data: [], total: 0, hasMore: false }
    }
    return response || { data: [], total: 0, hasMore: false }
  },

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
    const [response, error] = await apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/list-film-by-type', {
      type,
      ...params,
    })
    if (error) {
      console.error(error)
      return { data: [], total: 0, hasMore: false }
    }
    return response || { data: [], total: 0, hasMore: false }
  },

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
    const [response, error] = await apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/list-film-by-category', {
      category: categorySlug,
      ...params,
    })
    if (error) {
      console.error(error)
      return { data: [], total: 0, hasMore: false }
    }
    return response || { data: [], total: 0, hasMore: false }
  },

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
    const [response, error] = await apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/list-film-by-country', {
      country: countrySlug,
      ...params,
    })
    if (error) {
      console.error(error)
      return { data: [], total: 0, hasMore: false }
    }
    return response || { data: [], total: 0, hasMore: false }
  },

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
    const [response, error] = await apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/list-film-by-year', {
      year,
      ...params,
    })
    if (error) {
      console.error(error)
      return { data: [], total: 0, hasMore: false }
    }
    return response || { data: [], total: 0, hasMore: false }
  },

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
    const [response, error] = await apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/list-film-by-actor', {
      actor,
      ...params,
    })
    if (error) {
      console.error(error)
      return { data: [], total: 0, hasMore: false }
    }
    return response || { data: [], total: 0, hasMore: false }
  },

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
    const [response, error] = await apiClient.get<PaginatedResponse<Movie>>('/crawler/ophim/list-film-by-director', {
      director,
      ...params,
    })
    if (error) {
      console.error(error)
      return { data: [], total: 0, hasMore: false }
    }
    return response || { data: [], total: 0, hasMore: false }
  },

  getEpisode: async (slug: string, episodeNumber: number, serverName?: string): Promise<any> => {
    const [response, error] = await apiClient.get<any>(`/crawler/ophim/episode/${slug}`, {
      episodeNumber,
      ...(serverName && { serverName }),
    })
    if (error) {
      console.error(error)
      return null
    }
    return response
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
