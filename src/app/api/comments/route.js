import {NextResponse} from 'next/server';
import supabase from '@/lib/supabase';

// GET handler to fetch comments for a specific post
export async function GET(request) {
    const {searchParams} = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
        return NextResponse.json({error: 'Post ID is required'}, {status: 400});
    }

    try {
        const {data, error} = await supabase
            .from('comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', {ascending: true});

        if (error) {
            throw error;
        }

        return NextResponse.json({comments: data});
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({error: 'Failed to fetch comments'}, {status: 500});
    }
}

// POST handler to add a new comment
export async function POST(request) {
    try {
        const {postId, nickname, content} = await request.json();

        if (!postId || !nickname || !content) {
            return NextResponse.json({error: 'Post ID, nickname, and content are required'}, {status: 400});
        }

        const {data, error} = await supabase
            .from('comments')
            .insert([
                {
                    post_id: postId,
                    nickname,
                    content,
                }
            ])
            .select();

        if (error) {
            throw error;
        }

        return NextResponse.json({comment: data[0]});
    } catch (error) {
        console.error('Error adding comment:', error);
        return NextResponse.json({error: 'Failed to add comment'}, {status: 500});
    }
}