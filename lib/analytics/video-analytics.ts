/**
 * Video Analytics Tracker
 * Tracks video playback metrics, engagement, and quality
 */

import { createClient } from '@/lib/supabase/client';
import type { VideoAnalytics } from '@/types/advanced';

// ============================================
// VIDEO ANALYTICS TRACKER CLASS
// ============================================

export class VideoAnalyticsTracker {
  private supabase = createClient();
  private sessionId: string;
  private movieSlug: string;
  private episodeSlug?: string;
  private userId?: string;

  // Metrics
  private metrics: Partial<VideoAnalytics> = {
    playCount: 0,
    pauseCount: 0,
    seekCount: 0,
    bufferCount: 0,
    qualityChanges: 0,
    watchDurationSeconds: 0,
    bufferDurationSeconds: 0,
  };

  // Tracking state
  private isPlaying = false;
  private lastPlayTime?: number;
  private lastBufferTime?: number;
  private sessionStartTime: number;
  private syncInterval?: NodeJS.Timeout;

  // Device info
  private deviceInfo: {
    deviceType: string;
    browser: string;
    os: string;
    screenResolution: string;
  };

  constructor(movieSlug: string, episodeSlug?: string) {
    this.sessionId = this.generateSessionId();
    this.movieSlug = movieSlug;
    this.episodeSlug = episodeSlug;
    this.sessionStartTime = Date.now();
    this.deviceInfo = this.getDeviceInfo();

    // Get user ID if authenticated
    this.getUserId();

    // Sync metrics every 30 seconds
    this.syncInterval = setInterval(() => this.syncMetrics(), 30000);
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getUserId(): Promise<void> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      this.userId = user?.id;
    } catch (error) {
      console.error('[VideoAnalytics] Get user ID error:', error);
    }
  }

  private getDeviceInfo(): {
    deviceType: string;
    browser: string;
    os: string;
    screenResolution: string;
  } {
    const ua = navigator.userAgent;

    // Detect device type
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua);
    const isTablet = /iPad|Android/i.test(ua) && !/Mobile/i.test(ua);
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';
    else if (ua.includes('Edge')) browser = 'Edge';
    else if (ua.includes('Opera')) browser = 'Opera';

    // Detect OS
    let os = 'Unknown';
    if (ua.includes('Windows')) os = 'Windows';
    else if (ua.includes('Mac')) os = 'macOS';
    else if (ua.includes('Linux')) os = 'Linux';
    else if (ua.includes('Android')) os = 'Android';
    else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad'))
      os = 'iOS';

    // Screen resolution
    const screenResolution = `${window.screen.width}x${window.screen.height}`;

    return { deviceType, browser, os, screenResolution };
  }

  // ============================================
  // EVENT TRACKING
  // ============================================

  /**
   * Track play event
   */
  onPlay(currentTime: number): void {
    this.metrics.playCount = (this.metrics.playCount || 0) + 1;
    this.isPlaying = true;
    this.lastPlayTime = Date.now();

    console.log('[VideoAnalytics] Play event', {
      playCount: this.metrics.playCount,
      currentTime,
    });
  }

  /**
   * Track pause event
   */
  onPause(currentTime: number): void {
    this.metrics.pauseCount = (this.metrics.pauseCount || 0) + 1;

    if (this.isPlaying && this.lastPlayTime) {
      const watchTime = (Date.now() - this.lastPlayTime) / 1000;
      this.metrics.watchDurationSeconds =
        (this.metrics.watchDurationSeconds || 0) + watchTime;
    }

    this.isPlaying = false;
    this.lastPlayTime = undefined;

    console.log('[VideoAnalytics] Pause event', {
      pauseCount: this.metrics.pauseCount,
      currentTime,
      watchDuration: this.metrics.watchDurationSeconds,
    });
  }

  /**
   * Track seek event
   */
  onSeek(from: number, to: number): void {
    this.metrics.seekCount = (this.metrics.seekCount || 0) + 1;

    console.log('[VideoAnalytics] Seek event', {
      seekCount: this.metrics.seekCount,
      from,
      to,
    });
  }

  /**
   * Track buffer start
   */
  onBufferStart(): void {
    this.lastBufferTime = Date.now();

    console.log('[VideoAnalytics] Buffer start');
  }

  /**
   * Track buffer end
   */
  onBufferEnd(): void {
    this.metrics.bufferCount = (this.metrics.bufferCount || 0) + 1;

    if (this.lastBufferTime) {
      const bufferTime = (Date.now() - this.lastBufferTime) / 1000;
      this.metrics.bufferDurationSeconds =
        (this.metrics.bufferDurationSeconds || 0) + bufferTime;
    }

    this.lastBufferTime = undefined;

    console.log('[VideoAnalytics] Buffer end', {
      bufferCount: this.metrics.bufferCount,
      bufferDuration: this.metrics.bufferDurationSeconds,
    });
  }

  /**
   * Track quality change
   */
  onQualityChange(newQuality: string): void {
    this.metrics.qualityChanges = (this.metrics.qualityChanges || 0) + 1;
    this.metrics.videoQuality = newQuality;

    console.log('[VideoAnalytics] Quality change', {
      qualityChanges: this.metrics.qualityChanges,
      newQuality,
    });
  }

  /**
   * Track video ended
   */
  onEnded(duration: number): void {
    if (this.isPlaying && this.lastPlayTime) {
      const watchTime = (Date.now() - this.lastPlayTime) / 1000;
      this.metrics.watchDurationSeconds =
        (this.metrics.watchDurationSeconds || 0) + watchTime;
    }

    this.metrics.completionRate =
      ((this.metrics.watchDurationSeconds || 0) / duration) * 100;

    console.log('[VideoAnalytics] Video ended', {
      completionRate: this.metrics.completionRate,
      totalWatchTime: this.metrics.watchDurationSeconds,
    });

    // Final sync
    this.syncMetrics(true);
  }

  /**
   * Track video error
   */
  onError(error: string): void {
    console.error('[VideoAnalytics] Video error:', error);

    // Log error but don't stop tracking
  }

  /**
   * Track startup time
   */
  setStartupTime(startupTimeMs: number): void {
    this.metrics.startupTimeMs = startupTimeMs;

    console.log('[VideoAnalytics] Startup time', { startupTimeMs });
  }

  /**
   * Track average bitrate
   */
  setAverageBitrate(bitrate: number): void {
    this.metrics.averageBitrate = bitrate;
  }

  /**
   * Track drop-off point
   */
  onDropOff(currentTime: number): void {
    this.metrics.dropOffPointSeconds = Math.floor(currentTime);

    console.log('[VideoAnalytics] Drop-off', {
      dropOffPoint: this.metrics.dropOffPointSeconds,
    });
  }

  // ============================================
  // DATA SYNC
  // ============================================

  /**
   * Sync metrics to database
   */
  private async syncMetrics(isFinal: boolean = false): Promise<void> {
    try {
      // Calculate session duration
      const sessionDuration = (Date.now() - this.sessionStartTime) / 1000;

      // If still playing, add current session time
      if (this.isPlaying && this.lastPlayTime) {
        const currentWatchTime = (Date.now() - this.lastPlayTime) / 1000;
        this.metrics.watchDurationSeconds =
          (this.metrics.watchDurationSeconds || 0) + currentWatchTime;
        this.lastPlayTime = Date.now(); // Reset for next interval
      }

      const analyticsData = {
        user_id: this.userId,
        movie_slug: this.movieSlug,
        episode_slug: this.episodeSlug,
        session_id: this.sessionId,
        ...this.metrics,
        session_duration_seconds: Math.floor(sessionDuration),
        device_type: this.deviceInfo.deviceType,
        browser: this.deviceInfo.browser,
        os: this.deviceInfo.os,
        screen_resolution: this.deviceInfo.screenResolution,
        ended_at: isFinal ? new Date().toISOString() : undefined,
      };

      // Upsert to database
      const { error } = await this.supabase
        .from('video_analytics')
        .upsert(analyticsData, {
          onConflict: 'session_id',
        });

      if (error) {
        console.error('[VideoAnalytics] Sync error:', error);
      } else {
        console.log('[VideoAnalytics] Metrics synced', {
          sessionId: this.sessionId,
          isFinal,
        });
      }
    } catch (error) {
      console.error('[VideoAnalytics] Sync metrics error:', error);
    }
  }

  // ============================================
  // LIFECYCLE
  // ============================================

  /**
   * Clean up tracker
   */
  destroy(): void {
    // Final sync
    this.syncMetrics(true);

    // Clear interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    console.log('[VideoAnalytics] Tracker destroyed');
  }
}

// ============================================
// REACT HOOK FOR VIDEO ANALYTICS
// ============================================

export function useVideoAnalytics(movieSlug: string, episodeSlug?: string) {
  let tracker: VideoAnalyticsTracker | null = null;

  const initialize = () => {
    tracker = new VideoAnalyticsTracker(movieSlug, episodeSlug);
    return tracker;
  };

  const destroy = () => {
    if (tracker) {
      tracker.destroy();
      tracker = null;
    }
  };

  return {
    initialize,
    destroy,
  };
}

// ============================================
// PAGE PERFORMANCE TRACKING
// ============================================

export class PagePerformanceTracker {
  private supabase = createClient();
  private sessionId: string;
  private pagePath: string;
  private userId?: string;
  private startTime: number;

  constructor(pagePath: string) {
    this.sessionId = this.generateSessionId();
    this.pagePath = pagePath;
    this.startTime = Date.now();

    this.getUserId();
    this.trackPerformance();
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getUserId(): Promise<void> {
    try {
      const {
        data: { user },
      } = await this.supabase.auth.getUser();
      this.userId = user?.id;
    } catch (error) {
      console.error('[PagePerformance] Get user ID error:', error);
    }
  }

  private async trackPerformance(): Promise<void> {
    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      this.collectMetrics();
    } else {
      window.addEventListener('load', () => this.collectMetrics());
    }
  }

  private async collectMetrics(): Promise<void> {
    try {
      // Get performance metrics
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      const ttfb = navigation.responseStart - navigation.requestStart;
      const fcp = this.getFirstContentfulPaint();
      const lcp = await this.getLargestContentfulPaint();
      const fid = await this.getFirstInputDelay();
      const cls = await this.getCumulativeLayoutShift();

      // Get page engagement metrics
      const timeOnPage = Math.floor((Date.now() - this.startTime) / 1000);

      const analyticsData = {
        user_id: this.userId,
        page_path: this.pagePath,
        session_id: this.sessionId,
        referrer: document.referrer || undefined,
        ttfb_ms: Math.round(ttfb),
        fcp_ms: fcp ? Math.round(fcp) : undefined,
        lcp_ms: lcp ? Math.round(lcp) : undefined,
        fid_ms: fid ? Math.round(fid) : undefined,
        cls: cls ? parseFloat(cls.toFixed(3)) : undefined,
        time_on_page_seconds: timeOnPage,
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        os: this.getOS(),
      };

      // Send to database
      await this.supabase.from('page_analytics').insert(analyticsData);

      console.log('[PagePerformance] Metrics collected', analyticsData);
    } catch (error) {
      console.error('[PagePerformance] Collect metrics error:', error);
    }
  }

  private getFirstContentfulPaint(): number | null {
    const entries = performance.getEntriesByName('first-contentful-paint');
    return entries.length > 0 ? entries[0].startTime : null;
  }

  private async getLargestContentfulPaint(): Promise<number | null> {
    return new Promise((resolve) => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
          observer.disconnect();
        });

        observer.observe({ entryTypes: ['largest-contentful-paint'] });

        // Timeout after 10 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, 10000);
      } catch (error) {
        resolve(null);
      }
    });
  }

  private async getFirstInputDelay(): Promise<number | null> {
    return new Promise((resolve) => {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0] as any;
          resolve(firstEntry.processingStart - firstEntry.startTime);
          observer.disconnect();
        });

        observer.observe({ entryTypes: ['first-input'] });

        // Timeout after 10 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, 10000);
      } catch (error) {
        resolve(null);
      }
    });
  }

  private async getCumulativeLayoutShift(): Promise<number | null> {
    return new Promise((resolve) => {
      try {
        let clsScore = 0;

        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          }
        });

        observer.observe({ entryTypes: ['layout-shift'] });

        // Calculate CLS after 5 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve(clsScore);
        }, 5000);
      } catch (error) {
        resolve(null);
      }
    });
  }

  private getDeviceType(): string {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod|Android/i.test(ua)) return 'mobile';
    if (/iPad|Android/i.test(ua) && !/Mobile/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  private getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad'))
      return 'iOS';
    return 'Unknown';
  }
}

// Export for use in pages
export function trackPagePerformance(pagePath: string): void {
  if (typeof window !== 'undefined') {
    new PagePerformanceTracker(pagePath);
  }
}
