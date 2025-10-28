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
  ): Promise<[Response | null, Error | null]> {
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

      return [response, null]
    } catch (error) {
      clearTimeout(timeoutId)

      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay))
        return this.fetchWithRetry(url, options, attempt + 1)
      }

      return [null, this.handleError(error)]
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new Error(ERROR_MESSAGES.NETWORK_ERROR)
      }
      
      if (error.message.includes('401')) {
        return new Error(ERROR_MESSAGES.UNAUTHORIZED)
      }
      
      if (error.message.includes('403')) {
        return new Error(ERROR_MESSAGES.FORBIDDEN)
      }
      
      if (error.message.includes('404')) {
        return new Error(ERROR_MESSAGES.NOT_FOUND)
      }
      
      if (error.message.includes('429')) {
        return new Error(ERROR_MESSAGES.RATE_LIMIT)
      }
      
      if (error.message.includes('500')) {
        return new Error(ERROR_MESSAGES.SERVER_ERROR)
      }

      return error
    }

    return new Error(ERROR_MESSAGES.NETWORK_ERROR)
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<[T | null, Error | null]> {
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

    const [response, error] = await this.fetchWithRetry(url.toString())

    if (error) {
      return [null, error]
    }

    try {
      const data = await response!.json()
      return [data, null]
    } catch (jsonError) {
      return [null, this.handleError(jsonError)]
    }
  }

  async post<T>(endpoint: string, data?: any): Promise<[T | null, Error | null]> {
    const [response, error] = await this.fetchWithRetry(
      `${this.baseUrl}${endpoint}`,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      }
    )

    if (error) {
      return [null, error]
    }

    try {
      const responseData = await response!.json()
      return [responseData, null]
    } catch (jsonError) {
      return [null, this.handleError(jsonError)]
    }
  }

  async put<T>(endpoint: string, data?: any): Promise<[T | null, Error | null]> {
    const [response, error] = await this.fetchWithRetry(
      `${this.baseUrl}${endpoint}`,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      }
    )

    if (error) {
      return [null, error]
    }

    try {
      const responseData = await response!.json()
      return [responseData, null]
    } catch (jsonError) {
      return [null, this.handleError(jsonError)]
    }
  }

  async delete<T>(endpoint: string): Promise<[T | null, Error | null]> {
    const [response, error] = await this.fetchWithRetry(
      `${this.baseUrl}${endpoint}`,
      {
        method: 'DELETE',
      }
    )

    if (error) {
      return [null, error]
    }

    try {
      const responseData = await response!.json()
      return [responseData, null]
    } catch (jsonError) {
      return [null, this.handleError(jsonError)]
    }
  }
}

export const apiClient = new ApiClient()