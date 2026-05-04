import AsyncStorage from '@react-native-async-storage/async-storage';
import { Email } from '../types';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  ts: number;
}

function cacheKey(accountId: string, folder = 'INBOX'): string {
  return `mailswitch_emails_${accountId}_${folder}`;
}

export async function getCachedEmails(accountId: string): Promise<Email[] | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(accountId));
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<Email[]>;
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

export async function setCachedEmails(accountId: string, emails: Email[]): Promise<void> {
  try {
    const entry: CacheEntry<Email[]> = { data: emails, ts: Date.now() };
    await AsyncStorage.setItem(cacheKey(accountId), JSON.stringify(entry));
  } catch {
    // non-critical — ignore cache write errors
  }
}

export async function invalidateEmailCache(accountId: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(cacheKey(accountId));
  } catch {
    // ignore
  }
}

export async function updateEmailReadState(
  accountId: string,
  uid: string,
  isRead: boolean,
): Promise<void> {
  try {
    const cached = await getCachedEmails(accountId);
    if (!cached) return;
    const updated = cached.map((e) => (e.uid === uid ? { ...e, isRead } : e));
    await setCachedEmails(accountId, updated);
  } catch {
    // ignore
  }
}
