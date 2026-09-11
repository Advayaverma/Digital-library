import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

const BUCKET_NAME = 'book-covers';

/**
 * Upload a book cover image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadBookCover(file) {
  if (!file) return null;

  if (isSupabaseConfigured()) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Retrieve public access URL
      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (err) {
      console.error('Error uploading book cover:', err.message);
      throw err;
    }
  }

  // Fallback: create local object URL for preview
  return URL.createObjectURL(file);
}

/**
 * Delete a book cover image from Supabase Storage.
 */
export async function deleteBookCover(filePath) {
  if (!filePath || !isSupabaseConfigured()) return;

  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting book cover:', err.message);
  }
}
