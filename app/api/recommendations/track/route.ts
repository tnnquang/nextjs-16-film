/**
 * POST /api/recommendations/track
 * Track user interaction for ML training
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recommendationEngine } from '@/lib/ml/recommendation-engine';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { movieSlug, interactionType, interactionScore, metadata } = body;

    // Validate input
    if (!movieSlug || !interactionType || interactionScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Track interaction
    await recommendationEngine.trackInteraction({
      userId: user.id,
      movieSlug,
      interactionType,
      interactionScore,
      metadata,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Interaction tracked successfully',
    });
  } catch (error) {
    console.error('[API] Track interaction error:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}
