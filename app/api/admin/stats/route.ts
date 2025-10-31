/**
 * GET /api/admin/stats - Get dashboard statistics
 * Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Check authentication and admin role
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get statistics
    const [
      { count: totalUsers },
      { count: activeSubscriptions },
      { count: totalComments },
      { count: totalMovieViews },
    ] = await Promise.all([
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active'),
      supabase.from('comments').select('*', { count: 'exact', head: true }),
      supabase.from('viewing_history').select('*', { count: 'exact', head: true }),
    ]);

    // Get revenue this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: monthlyRevenue } = await supabase
      .from('payment_transactions')
      .select('amount')
      .eq('status', 'completed')
      .gte('created_at', startOfMonth.toISOString());

    const revenueThisMonth =
      monthlyRevenue?.reduce((sum, t) => sum + t.amount, 0) || 0;

    // Get top movies
    const { data: topMovies } = await supabase
      .from('viewing_history')
      .select('movie_slug, movie_data')
      .limit(10);

    // Aggregate by movie slug
    const movieCounts = new Map();
    topMovies?.forEach((view) => {
      const count = movieCounts.get(view.movie_slug) || 0;
      movieCounts.set(view.movie_slug, count + 1);
    });

    const topMoviesList = Array.from(movieCounts.entries())
      .map(([slug, count]) => ({
        slug,
        views: count,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: totalUsers || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalComments: totalComments || 0,
        totalMovieViews: totalMovieViews || 0,
        revenueThisMonth,
        topMovies: topMoviesList,
      },
    });
  } catch (error) {
    console.error('[API] Get admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics' },
      { status: 500 }
    );
  }
}
