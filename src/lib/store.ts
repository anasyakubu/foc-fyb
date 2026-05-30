import { supabase } from './supabase';
import { uploadPhotoIfNeeded, removePhotoFor } from './photos';
import type { Person } from './types';

// snake_case (DB) <-> camelCase (app) mapping
function fromDb(r: any): Person {
  return {
    id: r.id,
    name: r.name || '',
    nickname: r.nickname || '',
    hobbies: r.hobbies || '',
    relationship: r.relationship || '',
    favLecturer: r.fav_lecturer || '',
    easiestLevel: r.easiest_level || '',
    stressfulLevel: r.stressful_level || '',
    ifNotCS: r.if_not_cs || '',
    quote: r.quote || '',
    social: r.social || '',
    socialPlatform: r.social_platform || 'Instagram',
    department: r.department || '',
    photo: r.photo || '',
    issue: r.issue ?? 0,
    createdAt: r.created_at ? new Date(r.created_at).getTime() : Date.now(),
  };
}

function toDb(p: Person) {
  return {
    id: p.id,
    name: p.name,
    nickname: p.nickname,
    hobbies: p.hobbies,
    relationship: p.relationship,
    fav_lecturer: p.favLecturer,
    easiest_level: p.easiestLevel,
    stressful_level: p.stressfulLevel,
    if_not_cs: p.ifNotCS,
    quote: p.quote,
    social: p.social,
    social_platform: p.socialPlatform,
    department: p.department,
    photo: p.photo,
  };
}

export async function loadPeople(): Promise<Person[]> {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .order('issue', { ascending: false });
  if (error) { console.error('loadPeople', error); return []; }
  return (data || []).map(fromDb);
}

export async function getPerson(id: string): Promise<Person | undefined> {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) { console.error('getPerson', error); return undefined; }
  return data ? fromDb(data) : undefined;
}

export async function upsertPerson(p: Person): Promise<Person> {
  const photo = await uploadPhotoIfNeeded(p.id, p.photo);
  const row = toDb({ ...p, photo });
  const { data, error } = await supabase
    .from('people')
    .upsert(row, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return fromDb(data);
}

export async function addManyPeople(
  people: Person[],
  onProgress?: (done: number, total: number) => void
): Promise<Person[]> {
  // Upload photos in parallel first
  const total = people.length;
  let done = 0;
  const withPhotos = await Promise.all(people.map(async (p) => {
    const photo = await uploadPhotoIfNeeded(p.id, p.photo);
    done += 1;
    onProgress?.(done, total);
    return { ...p, photo };
  }));

  const rows = withPhotos.map(toDb);
  const { data, error } = await supabase
    .from('people')
    .insert(rows)
    .select();
  if (error) throw error;
  return (data || []).map(fromDb);
}

export async function removePerson(id: string): Promise<void> {
  const { error } = await supabase.from('people').delete().eq('id', id);
  if (error) throw error;
  await removePhotoFor(id);
}
