import { type Person, emptyPerson } from './types';

export function parseCSV(text: string): string[][] {
  const rows: string[][] = []; let cur: string[] = []; let field = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else {
      if (c === '"') q = true;
      else if (c === ',') { cur.push(field); field = ''; }
      else if (c === '\n') { cur.push(field); rows.push(cur); cur = []; field = ''; }
      else if (c === '\r') {}
      else field += c;
    }
  }
  if (field.length || cur.length) { cur.push(field); rows.push(cur); }
  return rows.filter(r => r.some(c => c.trim() !== ''));
}

const find = (headers: string[], ...keys: string[]) =>
  headers.findIndex(h => keys.some(k => h.toLowerCase().includes(k)));

export function mapRowsToPeople(rows: string[][]): Person[] {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim());
  const idx = {
    name: find(headers, 'full name', 'name'),
    nickname: find(headers, 'nickname', 'nick'),
    hobbies: find(headers, 'hobb'),
    relationship: find(headers, 'relationship', 'status'),
    favLecturer: find(headers, 'lecturer'),
    easiestLevel: find(headers, 'easiest'),
    stressfulLevel: find(headers, 'stressful', 'stress'),
    ifNotCS: find(headers, 'if not', 'what else'),
    quote: find(headers, 'quote'),
    social: find(headers, 'handle', 'social', 'instagram'),
    department: find(headers, 'department', 'course'),
    photo: find(headers, 'photo', 'image', 'picture'),
  };
  const g = (r: string[], i: number) => (i >= 0 ? (r[i] || '').trim() : '');
  return rows.slice(1).map(r => {
    const p = emptyPerson();
    p.name = g(r, idx.name);
    p.nickname = g(r, idx.nickname);
    p.hobbies = g(r, idx.hobbies);
    p.relationship = g(r, idx.relationship);
    p.favLecturer = g(r, idx.favLecturer) || 'NIL';
    p.easiestLevel = g(r, idx.easiestLevel);
    p.stressfulLevel = g(r, idx.stressfulLevel);
    p.ifNotCS = g(r, idx.ifNotCS);
    p.quote = g(r, idx.quote);
    p.social = g(r, idx.social);
    p.photo = g(r, idx.photo);
    if (idx.department >= 0) p.department = g(r, idx.department);
    return p;
  }).filter(p => p.name);
}
