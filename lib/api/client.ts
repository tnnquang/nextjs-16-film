import { API_CONFIG, ERROR_MESSAGES } from '@/lib/constants'
import { ApiResponse } from '@/types'

class ApiClient {
  private baseUrl: string
  private timeout: number
  private retryAttempts: number
  private retryDelay: number

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl
    this.timeout = API_CONFIG.timeout
    this.retryAttempts = API_CONFIG.retryAttempts
    this.retryDelay = API_CONFIG.retryDelay
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit = {},
    attempt = 1
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return response
    } catch (error) {
      clearTimeout(timeoutId)

      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        return this.fetchWithRetry(url, options, attempt + 1)
      }

      throw error
    }
  }

  private handleError(error: unknown): never {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
      }
      
      if (error.message.includes('401')) {
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED)
      }
      
      if (error.message.includes('403')) {
        throw new Error(ERROR_MESSAGES.FORBIDDEN)
      }
      
      if (error.message.includes('404')) {
        throw new Error(ERROR_MESSAGES.NOT_FOUND)
      }
      
      if (error.message.includes('429')) {
        throw new Error(ERROR_MESSAGES.RATE_LIMIT)
      }
      
      if (error.message.includes('500')) {
        throw new Error(ERROR_MESSAGES.SERVER_ERROR)
      }
    }

    throw new Error(ERROR_MESSAGES.NETWORK_ERROR)
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    try {
      const url = new URL(endpoint, this.baseUrl)
      
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            if (Array.isArray(value)) {
              value.forEach(v => url.searchParams.append(key, v.toString()))
            } else {
              url.searchParams.append(key, value.toString())
            }
          }
        })
      }

      const response = await this.fetchWithRetry(url.toString())
      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${endpoint}`,
        {
          method: 'POST',
          body: data ? JSON.stringify(data) : undefined,
        }
      )
      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${endpoint}`,
        {
          method: 'PUT',
          body: data ? JSON.stringify(data) : undefined,
        }
      )
      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }

  async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await this.fetchWithRetry(
        `${this.baseUrl}${endpoint}`,
        {
          method: 'DELETE',
        }
      )
      return await response.json()
    } catch (error) {
      this.handleError(error)
    }
  }
}

export const apiClient = new ApiClient()