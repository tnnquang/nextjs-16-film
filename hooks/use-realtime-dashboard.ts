/**
 * React Hook for Real-time Analytics Dashboard
 */

'use client'

import { useState, useEffect } from 'react'
import {
  RealtimeDashboardMetrics,
  subscribeToRealtimeDashboard,
  unsubscribeFromRealtimeDashboard,
} from '@/lib/analytics/realtime-dashboard'

export function useRealtimeDashboard() {
  const [metrics, setMetrics] = useState<RealtimeDashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)

    const channel = subscribeToRealtimeDashboard((newMetrics) => {
      setMetrics(newMetrics)
      setLoading(false)
      setError(null)
    })

    return () => {
      unsubscribeFromRealtimeDashboard(channel)
    }
  }, [])

  return {
    metrics,
    loading,
    error,
  }
}
