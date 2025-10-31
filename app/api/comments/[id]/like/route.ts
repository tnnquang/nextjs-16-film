/**
 * POST /api/comments/[id]/like - Like/unlike a comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already liked
    const { data: existing } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', params.id)
      .eq('user_id', user.id)
      .single();

    if (existing) {
      // Unlike
      const { error } = await supabase
        .from('comment_likes')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;

      return NextResponse.json({
        success: true,
        liked: false,
        message: 'Comment unliked',
      });
    } else {
      // Like
      const { error } = await supabase
        .from('comment_likes')
        .insert({
          comment_id: params.id,
          user_id: user.id,
        });

      if (error) throw error;

      return NextResponse.json({
        success: true,
        liked: true,
        message: 'Comment liked',
      });
    }
  } catch (error) {
    console.error('[API] Like comment error:', error);
    return NextResponse.json(
      { error: 'Failed to like/unlike comment' },
      { status: 500 }
    );
  }
}
