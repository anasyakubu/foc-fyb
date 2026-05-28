const KEY = 'fyb_auth_v1';
export const PASSCODE = 'FOC2022';
export const isAuthed = () => sessionStorage.getItem(KEY) === '1';
export const authenticate = (code: string) => {
  if (code.trim().toUpperCase() === PASSCODE) { sessionStorage.setItem(KEY, '1'); return true; }
  return false;
};
export const signOut = () => sessionStorage.removeItem(KEY);
