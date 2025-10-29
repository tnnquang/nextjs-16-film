/**
 * React Hook for Video Analytics Tracking
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  trackVideoEvent,
  startWatchSession,
  updateWatchSession,
  endWatchSession,
  getWatchProgress,
} from '@/lib/analytics/video-tracking'

interface UseVideoAnalyticsOptions {
  userId: string
  movieId: string
  episode?: number
  videoDuration: number
}

export function useVideoAnalytics({
  userId,
  movieId,
  episode,
  videoDuration,
}: UseVideoAnalyticsOptions) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [progress, setProgress] = useState<{ timestamp: number; percentage: number } | null>(null)
  const sessionStarted = useRef(false)
  const lastUpdateTime = useRef(0)
  const totalWatchTime = useRef(0)
  const bufferCount = useRef(0)
  const bufferStartTime = useRef<number | null>(null)
  const qualitiesUsed = useRef<Set<string>>(new Set(['auto']))

  // Load watch progress
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const savedProgress = await getWatchProgress(userId, movieId, episode)
        if (savedProgress) {
          setProgress(savedProgress)
        }
      } catch (err) {
        console.error('Failed to load watch progress:', err)
      }
    }

    loadProgress()
  }, [userId, movieId, episode])

  // Start session
  const initSession = useCallback(async () => {
    if (sessionStarted.current) return

    try {
      const id = await startWatchSession(userId, movieId, episode)
      setSessionId(id)
      sessionStarted.current = true
      lastUpdateTime.current = Date.now()
    } catch (err) {
      console.error('Failed to start watch session:', err)
    }
  }, [userId, movieId, episode])

  // Track play event
  const trackPlay = useCallback(
    async (currentTime: number) => {
      await initSession()

      try {
        await trackVideoEvent({
          user_id: userId,
          movie_id: movieId,
          episode,
          event_type: 'play',
          timestamp: currentTime,
          duration: videoDuration,
        })
      } catch (err) {
        console.error('Failed to track play event:', err)
      }

      lastUpdateTime.current = Date.now()
    },
    [userId, movieId, episode, videoDuration, initSession]
  )

  // Track pause event
  const trackPause = useCallback(
    async (currentTime: number) => {
      try {
        await trackVideoEvent({
          user_id: userId,
          movie_id: movieId,
          episode,
          event_type: 'pause',
          timestamp: currentTime,
          duration: videoDuration,
        })

        // Update watch time
        const now = Date.now()
        const elapsed = (now - lastUpdateTime.current) / 1000
        totalWatchTime.current += elapsed
        lastUpdateTime.current = now

        // Update session
        if (sessionId) {
          await updateWatchSession(sessionId, {
            total_watch_time: Math.floor(totalWatchTime.current),
            completion_percentage: Math.floor((currentTime / videoDuration) * 100),
          })
        }
      } catch (err) {
        console.error('Failed to track pause event:', err)
      }
    },
    [userId, movieId, episode, videoDuration, sessionId]
  )

  // Track seek event
  const trackSeek = useCallback(
    async (currentTime: number) => {
      try {
        await trackVideoEvent({
          user_id: userId,
          movie_id: movieId,
          episode,
          event_type: 'seek',
          timestamp: currentTime,
          duration: videoDuration,
        })
      } catch (err) {
        console.error('Failed to track seek event:', err)
      }
    },
    [userId, movieId, episode, videoDuration]
  )

  // Track buffer start
  const trackBufferStart = useCallback(() => {
    bufferStartTime.current = Date.now()
    bufferCount.current += 1
  }, [])

  // Track buffer end
  const trackBufferEnd = useCallback(
    async (currentTime: number) => {
      if (bufferStartTime.current === null) return

      const bufferTime = (Date.now() - bufferStartTime.current) / 1000

      try {
        await trackVideoEvent({
          user_id: userId,
          movie_id: movieId,
          episode,
          event_type: 'buffer',
          timestamp: currentTime,
          duration: videoDuration,
          buffer_time: bufferTime,
        })

        // Update session
        if (sessionId) {
          await updateWatchSession(sessionId, {
            buffer_count: bufferCount.current,
          })
        }
      } catch (err) {
        console.error('Failed to track buffer event:', err)
      }

      bufferStartTime.current = null
    },
    [userId, movieId, episode, videoDuration, sessionId]
  )

  // Track quality change
  const trackQualityChange = useCallback(
    async (currentTime: number, quality: string) => {
      qualitiesUsed.current.add(quality)

      try {
        await trackVideoEvent({
          user_id: userId,
          movie_id: movieId,
          episode,
          event_type: 'quality_change',
          timestamp: currentTime,
          duration: videoDuration,
          quality,
        })

        // Update session
        if (sessionId) {
          await updateWatchSession(sessionId, {
            quality_used: Array.from(qualitiesUsed.current),
          })
        }
      } catch (err) {
        console.error('Failed to track quality change:', err)
      }
    },
    [userId, movieId, episode, videoDuration, sessionId]
  )

  // Track completion
  const trackComplete = useCallback(async () => {
    try {
      await trackVideoEvent({
        user_id: userId,
        movie_id: movieId,
        episode,
        event_type: 'complete',
        timestamp: videoDuration,
        duration: videoDuration,
      })

      // Update session as complete
      if (sessionId) {
        await updateWatchSession(sessionId, {
          total_watch_time: Math.floor(videoDuration),
          completion_percentage: 100,
        })
        await endWatchSession(sessionId)
      }
    } catch (err) {
      console.error('Failed to track complete event:', err)
    }
  }, [userId, movieId, episode, videoDuration, sessionId])

  // Track error
  const trackError = useCallback(
    async (currentTime: number, errorMessage: string) => {
      try {
        await trackVideoEvent({
          user_id: userId,
          movie_id: movieId,
          episode,
          event_type: 'error',
          timestamp: currentTime,
          duration: videoDuration,
          error_message: errorMessage,
        })
      } catch (err) {
        console.error('Failed to track error event:', err)
      }
    },
    [userId, movieId, episode, videoDuration]
  )

  // Periodic progress update (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (sessionId && sessionStarted.current) {
        const now = Date.now()
        const elapsed = (now - lastUpdateTime.current) / 1000
        totalWatchTime.current += elapsed
        lastUpdateTime.current = now

        try {
          await updateWatchSession(sessionId, {
            total_watch_time: Math.floor(totalWatchTime.current),
          })
        } catch (err) {
          console.error('Failed to update watch progress:', err)
        }
      }
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [sessionId])

  // End session on unmount
  useEffect(() => {
    return () => {
      if (sessionId && sessionStarted.current) {
        endWatchSession(sessionId).catch(console.error)
      }
    }
  }, [sessionId])

  return {
    sessionId,
    progress,
    trackPlay,
    trackPause,
    trackSeek,
    trackBufferStart,
    trackBufferEnd,
    trackQualityChange,
    trackComplete,
    trackError,
  }
}
