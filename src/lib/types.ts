export interface Person {
  id: string;
  name: string;
  nickname: string;
  hobbies: string;
  relationship: string;
  favLecturer: string;
  easiestLevel: string;
  stressfulLevel: string;
  ifNotCS: string;
  quote: string;
  social: string;
  socialPlatform: string;
  department: string;
  photo: string;
  issue: number; // editorial issue number, auto
  createdAt: number;
}

export const FACULTY = 'Faculty of Computing';
export const SCHOOL = 'Bayero University Kano';
export const SET = 'Class of 2022';

export const emptyPerson = (): Person => ({
  id: crypto.randomUUID(),
  name: '', nickname: '', hobbies: '', relationship: '',
  favLecturer: '', easiestLevel: '', stressfulLevel: '', ifNotCS: '',
  quote: '', social: '', socialPlatform: 'Instagram',
  department: 'Computer Science', photo: '', issue: 1, createdAt: Date.now(),
});
