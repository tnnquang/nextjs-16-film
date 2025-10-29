/**
 * POST /api/social/follow - Follow/unfollow a user
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { followingId } = body;

    if (!followingId) {
      return NextResponse.json(
        { error: 'Missing followingId' },
        { status: 400 }
      );
    }

    // Can't follow yourself
    if (followingId === user.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if already following
    const { data: existing } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', followingId)
      .single();

    if (existing) {
      // Unfollow
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        following: false,
        message: 'Unfollowed successfully',
      });
    } else {
      // Follow
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: followingId,
        });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        following: true,
        message: 'Followed successfully',
      });
    }
  } catch (error) {
    console.error('[API] Follow error:', error);
    return NextResponse.json(
      { error: 'Failed to follow/unfollow' },
      { status: 500 }
    );
  }
}
