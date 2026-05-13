import { MockUser, CounselorRole } from '@/types/activity';

const STORAGE_KEY = 'ramah_user';
const SETUP_KEY   = 'ramah_profile_setup';

export const DEFAULT_USER: MockUser = {
  id: 'mock-user-1',
  name: 'Counselor',
  role: 'social_counselor',
  defaultAgeGroup: '10-12',
};

export function getMockUser(): MockUser {
  if (typeof window === 'undefined') return DEFAULT_USER;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_USER;
  } catch {
    return DEFAULT_USER;
  }
}

export function setMockUser(updates: Partial<MockUser>): void {
  if (typeof window === 'undefined') return;
  const current = getMockUser();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...updates }));
}

export function isProfileComplete(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SETUP_KEY) === 'done';
}

export function markProfileComplete(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETUP_KEY, 'done');
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-session';
  const key = 'ramah_session_id';
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

export function getCreatorId(): string {
  if (typeof window === 'undefined') return '';
  const key = 'ramah_creator_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `creator_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export const AGE_GROUPS: { value: string; he: string; en: string }[] = [
  { value: '6-8',   he: 'כוכבים — גיל 6–8',   en: 'Kochavim — ages 6–8' },
  { value: '8-10',  he: 'אילנות — גיל 8–10',  en: 'Ilanot — ages 8–10' },
  { value: '10-12', he: 'טבע — גיל 10–12',     en: 'Teva — ages 10–12' },
  { value: '12-14', he: 'ניבונים — גיל 12–14', en: 'Nitzanim / Nivonim — ages 12–14' },
  { value: '14-16', he: 'בוגרים — גיל 14–16',  en: 'Bogrim — ages 14–16' },
  { value: '16-18', he: 'גשר — גיל 16–18',     en: 'Gesher — ages 16–18' },
];

export const ROLES: { value: CounselorRole; he: string; en: string; icon: string }[] = [
  { value: 'social_counselor',      he: 'מדריך / מדריכה',       en: 'Social Counselor',      icon: '🏕️' },
  { value: 'waterfront_instructor', he: 'מדריך אגם',             en: 'Waterfront Instructor', icon: '🌊' },
  { value: 'art',                   he: 'אמנות',                 en: 'Art',                   icon: '🎨' },
  { value: 'martial_arts',          he: 'אומנויות לחימה',        en: 'Martial Arts',          icon: '🥋' },
  { value: 'theater',               he: 'תיאטרון',               en: 'Theater',               icon: '🎭' },
  { value: 'ropes',                 he: 'חבלים',                 en: 'Ropes Course',          icon: '🧗' },
  { value: 'basketball',            he: 'כדורסל',                en: 'Basketball',            icon: '🏀' },
  { value: 'sports',                he: 'ספורט',                 en: 'Sports',                icon: '⚽' },
  { value: 'music',                 he: 'מוזיקה',                en: 'Music',                 icon: '🎵' },
  { value: 'dance',                 he: 'ריקוד',                 en: 'Dance',                 icon: '💃' },
  { value: 'nature',                he: 'טבע',                   en: 'Nature',                icon: '🌿' },
  { value: 'hebrew_jewish',         he: 'עברית / חינוך יהודי',   en: 'Hebrew / Jewish Ed',    icon: '✡️' },
];
