import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create admin client with service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // First get the photo to find the storage path
    const { data: photo, error: fetchError } = await supabaseAdmin
      .from('progress_photos')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Extract file path from URL for storage deletion
    // URL format: https://xxx.supabase.co/storage/v1/object/public/progress-photos/filename.jpg
    const photoUrl = photo.photo_url;
    const storagePathMatch = photoUrl.match(/progress-photos\/(.+)$/);

    if (storagePathMatch && storagePathMatch[1]) {
      const filePath = storagePathMatch[1];

      // Delete from storage
      const { error: storageError } = await supabaseAdmin.storage
        .from('progress-photos')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if storage fails
      }
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('progress_photos')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json(
        { error: 'Failed to delete photo from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully',
      deletedId: id
    });

  } catch (error) {
    console.error('Error deleting progress photo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
