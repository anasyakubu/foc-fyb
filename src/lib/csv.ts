import { type Person, emptyPerson } from './types';

// ---------- Delimiter-aware CSV/TSV parser ----------

function detectDelimiter(text: string): string {
  const sample = text.split('\n').slice(0, 3).join('\n');
  const tabs = (sample.match(/\t/g) || []).length;
  const commas = (sample.match(/,/g) || []).length;
  return tabs > commas ? '\t' : ',';
}

export function parseCSV(text: string, delimiter?: string): string[][] {
  const d = delimiter || detectDelimiter(text);
  const rows: string[][] = []; let cur: string[] = []; let field = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else {
      if (c === '"') q = true;
      else if (c === d) { cur.push(field); field = ''; }
      else if (c === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
      else if (c === '\r') {
        console.log("C", c);
      }
      else field += c;
    }
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

// ---------- Google Drive URL handling ----------

// Extracts a Drive file ID from any of the common URL shapes Forms produces:
//   https://drive.google.com/open?id=FILE_ID
//   https://drive.google.com/file/d/FILE_ID/view
//   https://drive.google.com/uc?export=view&id=FILE_ID
//   https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
//   https://lh3.googleusercontent.com/d/FILE_ID=w1000
export function extractDriveId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{20,})/,
    /[?&]id=([a-zA-Z0-9_-]{20,})/,
    /\/d\/([a-zA-Z0-9_-]{20,})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

// Convert any Drive URL to a CORS-friendly image URL.
// lh3.googleusercontent.com responds with proper CORS headers for public files.
export function toImageUrl(url: string): string {
  const id = extractDriveId(url);
  if (!id) return url;
  return `https://lh3.googleusercontent.com/d/${id}=w1200`;
}

// Fetch an image URL and convert to a base64 data URL so it works with
// the html-to-image canvas export. Falls back to the URL if fetch fails.
export async function urlToDataUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, { mode: 'cors', credentials: 'omit' });
    if (!res.ok) return url;
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

// ---------- Header mapping (precise, multi-pass) ----------

const findHeader = (headers: string[], ...keys: string[]): number => {
  const lower = headers.map(h => h.toLowerCase().trim());
  // Pass 1: exact
  for (const k of keys) {
    const i = lower.findIndex(h => h === k.toLowerCase());
    if (i >= 0) return i;
  }
  // Pass 2: startsWith
  for (const k of keys) {
    const i = lower.findIndex(h => h.startsWith(k.toLowerCase()));
    if (i >= 0) return i;
  }
  // Pass 3: contains
  for (const k of keys) {
    const i = lower.findIndex(h => h.includes(k.toLowerCase()));
    if (i >= 0) return i;
  }
  return -1;
};

export function mapRowsToPeople(rows: string[][]): Person[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim());

  const idx = {
    name: findHeader(headers, 'full name', 'name'),
    nickname: findHeader(headers, 'nickname', 'nick'),
    department: findHeader(headers, 'department', 'course'),
    hobbies: findHeader(headers, 'hobbies', 'hobby'),
    relationship: findHeader(headers, 'relationship status', 'relationship'),
    favLecturer: findHeader(headers, 'favourite lecturer', 'favorite lecturer', 'lecturer'),
    easiestLevel: findHeader(headers, 'easiest level', 'easiest'),
    stressfulLevel: findHeader(headers, 'most stressful level', 'stressful level', 'stressful', 'stress'),
    ifNotCS: findHeader(headers, 'if not computing', 'if not', 'what else'),
    quote: findHeader(headers, 'best quote', 'quote'),
    // Order matters: 'handle' must be searched BEFORE 'social' so that
    // "Social Platform" doesn't get picked up as the handle column.
    social: findHeader(headers, 'social handle', 'handle', 'instagram', 'username'),
    socialPlatform: findHeader(headers, 'social platform', 'platform'),
    photo: findHeader(headers, 'photo', 'picture', 'image', 'portrait'),
  };

  const g = (r: string[], i: number) => (i >= 0 ? (r[i] || '').trim() : '');

  return rows.slice(1).map(r => {
    const p = emptyPerson();
    p.name = g(r, idx.name);
    p.nickname = g(r, idx.nickname);
    if (idx.department >= 0) p.department = g(r, idx.department) || p.department;
    p.hobbies = g(r, idx.hobbies);
    p.relationship = g(r, idx.relationship);
    p.favLecturer = g(r, idx.favLecturer) || 'NIL';
    p.easiestLevel = g(r, idx.easiestLevel);
    p.stressfulLevel = g(r, idx.stressfulLevel);
    p.ifNotCS = g(r, idx.ifNotCS);
    p.quote = g(r, idx.quote);
    p.social = g(r, idx.social).replace(/^@/, '');
    if (idx.socialPlatform >= 0) {
      const plat = g(r, idx.socialPlatform);
      if (plat) p.socialPlatform = plat;
    }
    // Normalize any Drive URL right away
    const rawPhoto = g(r, idx.photo);
    p.photo = rawPhoto ? toImageUrl(rawPhoto) : '';
    return p;
  }).filter(p => p.name);
}

// Async variant: also pre-fetches photo URLs into base64 data URLs so the
// PNG export works without CORS issues. Calls onProgress as each one loads.
export async function mapRowsToPeopleWithPhotos(
  rows: string[][],
  onProgress?: (loaded: number, total: number) => void
): Promise<Person[]> {
  const people = mapRowsToPeople(rows);
  const photoIdxs = people
    .map((p, i) => (p.photo && /^https?:/i.test(p.photo) ? i : -1))
    .filter(i => i >= 0);

  if (photoIdxs.length === 0) return people;

  let loaded = 0;
  onProgress?.(0, photoIdxs.length);

  await Promise.all(photoIdxs.map(async (i) => {
    const dataUrl = await urlToDataUrl(people[i].photo);
    people[i].photo = dataUrl;
    loaded += 1;
    onProgress?.(loaded, photoIdxs.length);
  }));

  return people;
}
