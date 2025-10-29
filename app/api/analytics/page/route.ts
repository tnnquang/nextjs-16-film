/**
 * POST /api/analytics/page - Track page performance
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const {
      pagePath,
      sessionId,
      referrer,
      ttfbMs,
      fcpMs,
      lcpMs,
      fidMs,
      cls,
      timeOnPageSeconds,
      scrollDepthPercentage,
      deviceType,
      browser,
      os,
    } = body;

    if (!pagePath) {
      return NextResponse.json(
        { error: 'Missing pagePath' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('page_analytics')
      .insert({
        user_id: user?.id,
        page_path: pagePath,
        session_id: sessionId,
        referrer,
        ttfb_ms: ttfbMs,
        fcp_ms: fcpMs,
        lcp_ms: lcpMs,
        fid_ms: fidMs,
        cls,
        time_on_page_seconds: timeOnPageSeconds,
        scroll_depth_percentage: scrollDepthPercentage,
        device_type: deviceType,
        browser,
        os,
      });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Page analytics tracked successfully',
    });
  } catch (error) {
    console.error('[API] Track page analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to track page analytics' },
      { status: 500 }
    );
  }
}
