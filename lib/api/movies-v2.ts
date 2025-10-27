/**
 * CineVerse API Client - Updated for latest API schema
 * Base URL: https://cinevserse-api.nhatquang.shop
 * API Version: 2.0.0
 */

import { apiClient } from './client'

// Types based on API schema
export interface PaginationCursor {
  view: number
  createdAt: string
  id: string
}

export interface FilterOptions {
  countries?: string[]
  categories?: string[]
  types?: ('series' | 'single' | 'hoathinh')[]
  isCinema?: boolean
}

export interface FilterFilmsDto {
  keyword?: string
  countries?: string[]
  categories?: string[]
  types?: ('series' | 'single' | 'hoathinh')[]
  isCinema?: boolean
  lastCursor?: PaginationCursor
  firstCursor?: PaginationCursor
  limit?: number
}

export interface AdvanceFilterDto {
  keyword?: string
  include?: FilterOptions
  exclude?: FilterOptions
  lastCursor?: PaginationCursor
  firstCursor?: PaginationCursor
  limit?: number
}

export interface SortOptions {
  sortBy?: 'view' | 'createdAt' | 'year'
  sortOrder?: 'asc' | 'desc'
}

export interface FilmResponse {
  data: any[]
  pagination: {
    hasNextPage: boolean
    hasPrevPage: boolean
    nextCursor?: PaginationCursor
    prevCursor?: PaginationCursor
    totalDocuments: number
    limit: number
  }
}

export interface CategoryResponse {
  _id: string
  name: string
  slug: string
}

export interface CountryResponse {
  _id: string
  name: string
  slug: string
}

export interface EpisodeResponse {
  filmSlug: string
  episodes: Array<{
    serverName: string
    episodes: Array<{
      name: string
      slug: string
      filename: string
      link_embed: string
      link_m3u8: string
    }>
  }>
}

/**
 * CineVerse API Service - V2
 * Comprehensive API client for all endpoints
 */
export const movieApiV2 = {
  // ==================== Basic Film Operations ====================

  /**
   * Get all countries
   */
  getCountries: async () => {
    return apiClient.get<CountryResponse[]>('/crawler/ophim/countries')
  },

  /**
   * Get all categories
   */
  getCategories: async () => {
    return apiClient.get<CategoryResponse[]>('/crawler/ophim/categories')
  },

  /**
   * Get film information by slug
   */
  getFilmBySlug: async (slug: string) => {
    return apiClient.get<any>(`/crawler/ophim/info/${slug}`)
  },

  /**
   * Get all episodes for a film
   */
  getFilmEpisodes: async (slug: string) => {
    return apiClient.get<EpisodeResponse>(`/crawler/ophim/info/${slug}/episodes`)
  },

  /**
   * Get specific episode of a film
   */
  getFilmEpisode: async (slug: string, episode: string, serverName?: string) => {
    return apiClient.get<any>(`/crawler/ophim/info/${slug}/episodes/${episode}`, {
      serverName
    })
  },

  // ==================== Trending & Popular ====================

  /**
   * Get hot/trending films
   */
  getHotFilms: async (limit: number = 100) => {
    return apiClient.get<FilmResponse>('/crawler/ophim/hot', { limit })
  },

  /**
   * Get recently updated films
   */
  getRecentlyUpdated: async (filters?: FilterFilmsDto) => {
    return apiClient.get<FilmResponse>('/crawler/ophim/recently-updated', filters)
  },

  /**
   * Get newly added films
   */
  getNewFilms: async (filters?: FilterFilmsDto) => {
    return apiClient.get<FilmResponse>('/crawler/ophim/new', filters)
  },

  // ==================== Advanced Search & Filtering ====================

  /**
   * Search films with keyword
   */
  searchFilms: async (params: FilterFilmsDto) => {
    return apiClient.get<FilmResponse>('/crawler/ophim/search', params)
  },

  /**
   * Advanced search with include/exclude filters
   */
  advancedSearch: async (params: AdvanceFilterDto) => {
    return apiClient.post<FilmResponse>('/crawler/ophim/search/advance', params)
  },

  /**
   * Get films sorted by criteria
   */
  getFilmsSorted: async (params: FilterFilmsDto & SortOptions) => {
    return apiClient.get<FilmResponse>('/crawler/ophim/sort', params)
  },

  /**
   * Advanced sorting with include/exclude filters
   */
  advancedSort: async (params: AdvanceFilterDto & SortOptions) => {
    return apiClient.post<FilmResponse>('/crawler/ophim/sort/advance', params)
  },

  // ==================== Filter by Attributes ====================

  /**
   * Get films by type (series, single, hoathinh)
   */
  getFilmsByType: async (type: 'series' | 'single' | 'hoathinh', filters?: FilterFilmsDto) => {
    return apiClient.get<FilmResponse>(`/crawler/ophim/type/${type}`, filters)
  },

  /**
   * Get films by category
   */
  getFilmsByCategory: async (categorySlug: string, filters?: FilterFilmsDto) => {
    return apiClient.get<FilmResponse>(`/crawler/ophim/category/${categorySlug}`, filters)
  },

  /**
   * Get films by country
   */
  getFilmsByCountry: async (countrySlug: string, filters?: FilterFilmsDto) => {
    return apiClient.get<FilmResponse>(`/crawler/ophim/country/${countrySlug}`, filters)
  },

  /**
   * Get films by year
   */
  getFilmsByYear: async (year: number, filters?: FilterFilmsDto) => {
    return apiClient.get<FilmResponse>(`/crawler/ophim/year/${year}`, filters)
  },

  /**
   * Get cinema release films
   */
  getCinemaFilms: async (filters?: FilterFilmsDto) => {
    return apiClient.get<FilmResponse>('/crawler/ophim/cinema', filters)
  },

  /**
   * Get films by actor
   */
  getFilmsByActor: async (actorName: string, filters?: FilterFilmsDto) => {
    return apiClient.get<FilmResponse>(`/crawler/ophim/actor/${encodeURIComponent(actorName)}`, filters)
  },

  /**
   * Get films by director
   */
  getFilmsByDirector: async (directorName: string, filters?: FilterFilmsDto) => {
    return apiClient.get<FilmResponse>(`/crawler/ophim/director/${encodeURIComponent(directorName)}`, filters)
  },

  // ==================== Multi-Filter Queries ====================

  /**
   * Get films by type and category
   */
  getFilmsByTypeAndCategory: async (
    type: 'series' | 'single' | 'hoathinh',
    categorySlug: string,
    filters?: FilterFilmsDto
  ) => {
    return apiClient.get<FilmResponse>(
      `/crawler/ophim/type/${type}/category/${categorySlug}`,
      filters
    )
  },

  /**
   * Get films by type and country
   */
  getFilmsByTypeAndCountry: async (
    type: 'series' | 'single' | 'hoathinh',
    countrySlug: string,
    filters?: FilterFilmsDto
  ) => {
    return apiClient.get<FilmResponse>(
      `/crawler/ophim/type/${type}/country/${countrySlug}`,
      filters
    )
  },

  /**
   * Get films by type and year
   */
  getFilmsByTypeAndYear: async (
    type: 'series' | 'single' | 'hoathinh',
    year: number,
    filters?: FilterFilmsDto
  ) => {
    return apiClient.get<FilmResponse>(
      `/crawler/ophim/type/${type}/year/${year}`,
      filters
    )
  },

  /**
   * Get films by category and country
   */
  getFilmsByCategoryAndCountry: async (
    categorySlug: string,
    countrySlug: string,
    filters?: FilterFilmsDto
  ) => {
    return apiClient.get<FilmResponse>(
      `/crawler/ophim/category/${categorySlug}/country/${countrySlug}`,
      filters
    )
  },

  /**
   * Get films by category and year
   */
  getFilmsByCategoryAndYear: async (
    categorySlug: string,
    year: number,
    filters?: FilterFilmsDto
  ) => {
    return apiClient.get<FilmResponse>(
      `/crawler/ophim/category/${categorySlug}/year/${year}`,
      filters
    )
  },

  /**
   * Get films by country and year
   */
  getFilmsByCountryAndYear: async (
    countrySlug: string,
    year: number,
    filters?: FilterFilmsDto
  ) => {
    return apiClient.get<FilmResponse>(
      `/crawler/ophim/country/${countrySlug}/year/${year}`,
      filters
    )
  },

  // ==================== Helper Functions ====================

  /**
   * Build pagination params for next page
   */
  buildNextPageParams: (response: FilmResponse, additionalParams?: any) => {
    const { pagination } = response
    if (!pagination.hasNextPage || !pagination.nextCursor) {
      return null
    }
    return {
      ...additionalParams,
      lastCursor: pagination.nextCursor,
    }
  },

  /**
   * Build pagination params for previous page
   */
  buildPrevPageParams: (response: FilmResponse, additionalParams?: any) => {
    const { pagination } = response
    if (!pagination.hasPrevPage || !pagination.prevCursor) {
      return null
    }
    return {
      ...additionalParams,
      firstCursor: pagination.prevCursor,
    }
  },
}

// Export for backward compatibility
export { movieApiV2 as movieApi }