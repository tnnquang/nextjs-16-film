/**
 * GET /api/social/activity - Get user activity feed
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeFollowing = searchParams.get('following') === 'true';

    let query = supabase
      .from('user_activities')
      .select(`
        *,
        user_profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (userId) {
      // Get specific user's activity
      query = query.eq('user_id', userId);
    } else if (includeFollowing) {
      // Get activity from users you follow
      const { data: following } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map((f) => f.following_id) || [];
      followingIds.push(user.id); // Include own activity

      query = query.in('user_id', followingIds);
    } else {
      // Get own activity
      query = query.eq('user_id', user.id);
    }

    const { data: activities, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error('[API] Get activity error:', error);
    return NextResponse.json(
      { error: 'Failed to get activity feed' },
      { status: 500 }
    );
  }
}
