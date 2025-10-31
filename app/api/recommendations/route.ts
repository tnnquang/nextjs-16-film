/**
 * GET /api/recommendations
 * Get personalized movie recommendations for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { recommendationEngine } from '@/lib/ml/recommendation-engine';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Please login to get recommendations' },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const algorithm = searchParams.get('algorithm') as
      | 'hybrid'
      | 'collaborative'
      | 'content_based'
      | null;

    // Get recommendations based on algorithm
    let recommendations;

    if (algorithm === 'collaborative') {
      recommendations = await recommendationEngine.getCollaborativeRecommendations(
        user.id,
        limit
      );
    } else if (algorithm === 'content_based') {
      recommendations = await recommendationEngine.getContentBasedRecommendations(
        user.id,
        limit
      );
    } else {
      // Default to hybrid
      recommendations = await recommendationEngine.getHybridRecommendations(
        user.id,
        limit
      );
    }

    // Fetch movie details for each recommendation
    const movieSlugs = recommendations.map((r) => r.movieSlug);

    // Here you would fetch actual movie data from your API
    // For now, we'll return the recommendations with slugs
    const { data: movies } = await supabase
      .from('viewing_history')
      .select('movie_slug, movie_data')
      .in('movie_slug', movieSlugs)
      .limit(1);

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        algorithm: algorithm || 'hybrid',
        userId: user.id,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('[API] Get recommendations error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Failed to get recommendations',
      },
      { status: 500 }
    );
  }
}
