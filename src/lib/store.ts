import type { Person } from './types';
const KEY = 'fyb_people_v2';

export const loadPeople = (): Person[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
};
export const savePeople = (p: Person[]) => localStorage.setItem(KEY, JSON.stringify(p));

const nextIssueNumber = () => {
  const all = loadPeople();
  return all.length ? Math.max(...all.map(p => p.issue || 0)) + 1 : 1;
};

export const upsertPerson = (person: Person): Person[] => {
  const all = loadPeople();
  const i = all.findIndex(x => x.id === person.id);
  if (i >= 0) { all[i] = person; }
  else { person.issue = person.issue || nextIssueNumber(); all.push(person); }
  savePeople(all);
  return all;
};
export const addManyPeople = (people: Person[]): Person[] => {
  const all = loadPeople();
  let issue = all.length ? Math.max(...all.map(p => p.issue || 0)) : 0;
  people.forEach(p => { issue += 1; p.issue = issue; all.push(p); });
  savePeople(all);
  return all;
};
export const removePerson = (id: string): Person[] => {
  const all = loadPeople().filter(x => x.id !== id);
  savePeople(all);
  return all;
};
export const getPerson = (id: string): Person | undefined =>
  loadPeople().find(x => x.id === id);
