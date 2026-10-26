import { File } from 'expo-file-system';
import { supabase } from '@/lib/supabase';

// `fetch(localUri).blob()` is unreliable on Android for local picker URIs — it can
// silently resolve with garbage content instead of the real file. Reading the file's
// bytes directly via expo-file-system's File.arrayBuffer() is the reliable path.
export async function uploadAssetToBucket(bucket: string, uri: string, extension: string, contentType?: string) {
  const file = new File(uri);
  const arrayBuffer = await file.arrayBuffer();
  const path = `${Date.now()}.${extension}`;
  const { error } = await supabase.storage.from(bucket).upload(path, arrayBuffer, {
    contentType: contentType || undefined,
  });
  if (error) return { error, publicUrl: null as string | null };
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { error: null, publicUrl: data.publicUrl };
}
