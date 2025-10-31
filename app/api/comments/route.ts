/**
 * GET /api/comments - Get comments for a movie
 * POST /api/comments - Create a new comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const movieSlug = searchParams.get('movieSlug');
    const parentId = searchParams.get('parentId');

    if (!movieSlug) {
      return NextResponse.json(
        { error: 'Missing movieSlug parameter' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('comments')
      .select(`
        *,
        user_profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .eq('movie_slug', movieSlug)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else {
      query = query.is('parent_id', null);
    }

    const { data: comments, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('[API] Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to get comments' },
      { status: 500 }
    );
  }
}

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
    const { movieSlug, content, parentId } = body;

    if (!movieSlug || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate content length
    if (content.length > 2000) {
      return NextResponse.json(
        { error: 'Comment too long (max 2000 characters)' },
        { status: 400 }
      );
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        movie_slug: movieSlug,
        user_id: user.id,
        parent_id: parentId || null,
        content,
      })
      .select(`
        *,
        user_profiles (
          username,
          display_name,
          avatar_url
        )
      `)
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: comment,
      message: 'Comment created successfully',
    });
  } catch (error) {
    console.error('[API] Create comment error:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
