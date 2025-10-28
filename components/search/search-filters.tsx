'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import movieApiCorrected from '@/lib/api/movies-corrected'
import { SearchFilters as SearchFiltersType } from '@/types'
import { CACHE_TTL, MOVIE_TYPES, QUALITY_OPTIONS } from '@/lib/constants'
import { buildQueryString } from '@/lib/utils'

interface SearchFiltersProps {
  currentFilters: SearchFiltersType & { page: number }
  query: string
}

export function SearchFilters({ currentFilters, query }: SearchFiltersProps) {
  const router = useRouter()
  const [localFilters, setLocalFilters] = useState(currentFilters)

  // Fetch categories and countries for filter options
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => movieApiCorrected.getCategories(),
    staleTime: CACHE_TTL.CATEGORIES,
  })

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: () => movieApiCorrected.getCountries(),
    staleTime: CACHE_TTL.COUNTRIES,
  })

  // Generate year options (current year to 1900)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i)

  const applyFilters = () => {
    const params = buildQueryString({
      q: query,
      ...Object.fromEntries(
        Object.entries({ ...localFilters, page: 1 }).filter(([_, value]) => 
          value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)
        )
      )
    })
    router.push(`/search?${params}`)
  }

  const clearFilters = () => {
    const clearedFilters = {
      category: [],
      country: [],
      year: '',
      type: '',
      quality: '',
      page: 1
    }
    setLocalFilters(clearedFilters)
    
    const params = buildQueryString({
      q: query,
      page: 1
    })
    router.push(`/search?${params}`)
  }

  const hasActiveFilters = 
    (localFilters.category?.length || 0) > 0 ||
    (localFilters.country?.length || 0) > 0 ||
    localFilters.year ||
    localFilters.type ||
    localFilters.quality

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = localFilters.category || []
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter(id => id !== categoryId)
    
    setLocalFilters(prev => ({ ...prev, category: newCategories }))
  }

  const handleCountryChange = (countryId: string, checked: boolean) => {
    const currentCountries = localFilters.country || []
    const newCountries = checked
      ? [...currentCountries, countryId]
      : currentCountries.filter(id => id !== countryId)
    
    setLocalFilters(prev => ({ ...prev, country: newCountries }))
  }

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <Filter className="mr-2 h-5 w-5" />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-sm"
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Active Filters:</p>
          <div className="flex flex-wrap gap-2">
            {(localFilters.category || []).map(categoryId => {
              const category = categories.find(c => c._id === categoryId)
              return category ? (
                <Badge key={categoryId} variant="secondary" className="text-xs">
                  {category.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-auto p-0 text-xs"
                    onClick={() => handleCategoryChange(categoryId, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ) : null
            })}
            
            {(localFilters.country || []).map(countryId => {
              const country = countries.find(c => c._id === countryId)
              return country ? (
                <Badge key={countryId} variant="secondary" className="text-xs">
                  {country.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-auto p-0 text-xs"
                    onClick={() => handleCountryChange(countryId, false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ) : null
            })}
            
            {localFilters.year && (
              <Badge variant="secondary" className="text-xs">
                {localFilters.year}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-xs"
                  onClick={() => setLocalFilters(prev => ({ ...prev, year: '' }))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {localFilters.type && (
              <Badge variant="secondary" className="text-xs">
                {localFilters.type}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-xs"
                  onClick={() => setLocalFilters(prev => ({ ...prev, type: '' }))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {localFilters.quality && (
              <Badge variant="secondary" className="text-xs">
                {localFilters.quality}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-xs"
                  onClick={() => setLocalFilters(prev => ({ ...prev, quality: '' }))}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Filter Cards */}
      <div className="space-y-4">
        {/* Year Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Year</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Select
              value={localFilters.year}
              onValueChange={(value: string) => setLocalFilters(prev => ({ ...prev, year: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Years</SelectItem>
                {years.slice(0, 50).map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Type Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Type</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Select
              value={localFilters.type}
              onValueChange={(value: string) => setLocalFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value={MOVIE_TYPES.SINGLE}>Movies</SelectItem>
                <SelectItem value={MOVIE_TYPES.SERIES}>TV Series</SelectItem>
                <SelectItem value={MOVIE_TYPES.ANIME}>Anime</SelectItem>
                <SelectItem value={MOVIE_TYPES.TV_SHOWS}>TV Shows</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Quality Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Quality</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Select
              value={localFilters.quality}
              onValueChange={(value: string) => setLocalFilters(prev => ({ ...prev, quality: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Qualities</SelectItem>
                <SelectItem value="HD">HD</SelectItem>
                <SelectItem value="FHD">Full HD</SelectItem>
                <SelectItem value="4K">4K</SelectItem>
                <SelectItem value="SD">SD</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Categories Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Categories</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {categories.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.map(category => (
                  <div key={category._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category._id}`}
                      checked={(localFilters.category || []).includes(category._id)}
                      onCheckedChange={(checked: boolean | 'indeterminate') => 
                        handleCategoryChange(category._id, checked === true)
                      }
                    />
                    <label
                      htmlFor={`category-${category._id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <LoadingSpinner size="sm" />
            )}
          </CardContent>
        </Card>

        {/* Countries Filter */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Countries</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {countries.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {countries.slice(0, 20).map(country => (
                  <div key={country._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`country-${country._id}`}
                      checked={(localFilters.country || []).includes(country._id)}
                      onCheckedChange={(checked: boolean | 'indeterminate') => 
                        handleCountryChange(country._id, checked === true)
                      }
                    />
                    <label
                      htmlFor={`country-${country._id}`}
                      className="text-sm cursor-pointer flex-1"
                    >
                      {country.name}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <LoadingSpinner size="sm" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Apply Filters Button */}
      <div className="sticky bottom-4">
        <Button 
          onClick={applyFilters} 
          className="w-full"
          size="lg"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )
}