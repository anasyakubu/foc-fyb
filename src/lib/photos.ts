import { supabase, PORTRAITS_BUCKET } from './supabase';

// If photo is a data: URL, upload to Supabase Storage and return the public URL.
// If it's already an https URL (or empty), return it unchanged.
export async function uploadPhotoIfNeeded(personId: string, photo: string): Promise<string> {
  if (!photo) return '';
  if (!photo.startsWith('data:')) return photo;

  const blob = await (await fetch(photo)).blob();
  const mime = blob.type || 'image/jpeg';
  const ext = mime.includes('png') ? 'png'
            : mime.includes('webp') ? 'webp'
            : mime.includes('gif') ? 'gif'
            : 'jpg';
  const path = `${personId}.${ext}`;

  const { error } = await supabase.storage
    .from(PORTRAITS_BUCKET)
    .upload(path, blob, { upsert: true, contentType: mime, cacheControl: '3600' });
  if (error) throw error;

  const { data } = supabase.storage.from(PORTRAITS_BUCKET).getPublicUrl(path);
  // cache-bust so re-uploads (e.g. AI enhance) are picked up
  return `${data.publicUrl}?v=${Date.now()}`;
}

// Best-effort: remove any portrait we might have stored for this person.
export async function removePhotoFor(personId: string): Promise<void> {
  await supabase.storage
    .from(PORTRAITS_BUCKET)
    .remove([`${personId}.jpg`, `${personId}.png`, `${personId}.webp`, `${personId}.gif`]);
}
