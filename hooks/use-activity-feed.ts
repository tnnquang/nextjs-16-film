/**
 * React Hook for Activity Feed
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Activity,
  subscribeToActivityFeed,
  unsubscribeFromActivityFeed,
  fetchActivityFeed,
  createActivity,
} from '@/lib/realtime/activity-feed'

export function useActivityFeed(userId: string) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch initial activities
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true)
        const data = await fetchActivityFeed(userId)
        setActivities(data)
        setError(null)
      } catch (err) {
        setError('Failed to load activity feed')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadActivities()
  }, [userId])

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = subscribeToActivityFeed(userId, (activity) => {
      setActivities((prev) => [activity, ...prev])
    })

    return () => {
      unsubscribeFromActivityFeed(channel)
    }
  }, [userId])

  // Create a new activity
  const addActivity = useCallback(
    async (
      type: Activity['type'],
      data: {
        movieId?: string
        movieName?: string
        moviePoster?: string
        content?: string
        rating?: number
      }
    ) => {
      try {
        await createActivity(userId, type, data)
      } catch (err) {
        console.error('Failed to create activity:', err)
      }
    },
    [userId]
  )

  // Load more activities
  const loadMore = useCallback(async () => {
    try {
      const data = await fetchActivityFeed(userId, {
        offset: activities.length,
        limit: 20,
      })
      setActivities((prev) => [...prev, ...data])
    } catch (err) {
      console.error('Failed to load more activities:', err)
    }
  }, [userId, activities.length])

  return {
    activities,
    loading,
    error,
    addActivity,
    loadMore,
  }
}
