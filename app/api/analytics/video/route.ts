/**
 * POST /api/analytics/video - Track video analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get user if authenticated (optional for analytics)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const {
      movieSlug,
      episodeSlug,
      sessionId,
      playCount,
      pauseCount,
      seekCount,
      bufferCount,
      qualityChanges,
      watchDurationSeconds,
      bufferDurationSeconds,
      sessionDurationSeconds,
      averageBitrate,
      startupTimeMs,
      deviceType,
      browser,
      os,
      screenResolution,
      completionRate,
      dropOffPointSeconds,
    } = body;

    if (!movieSlug || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('video_analytics')
      .upsert({
        user_id: user?.id,
        movie_slug: movieSlug,
        episode_slug: episodeSlug,
        session_id: sessionId,
        play_count: playCount,
        pause_count: pauseCount,
        seek_count: seekCount,
        buffer_count: bufferCount,
        quality_changes: qualityChanges,
        watch_duration_seconds: watchDurationSeconds,
        buffer_duration_seconds: bufferDurationSeconds,
        session_duration_seconds: sessionDurationSeconds,
        average_bitrate: averageBitrate,
        startup_time_ms: startupTimeMs,
        device_type: deviceType,
        browser,
        os,
        screen_resolution: screenResolution,
        completion_rate: completionRate,
        drop_off_point_seconds: dropOffPointSeconds,
      }, {
        onConflict: 'session_id',
      });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Analytics tracked successfully',
    });
  } catch (error) {
    console.error('[API] Track video analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}
