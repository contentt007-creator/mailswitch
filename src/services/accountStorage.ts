import * as SecureStore from 'expo-secure-store';
import { Account, AccountFormData } from '../types';
import { getNextAccountColor } from '../theme';

const ACCOUNTS_KEY = 'mailswitch_accounts';

async function getAllAccounts(): Promise<Account[]> {
  try {
    const raw = await SecureStore.getItemAsync(ACCOUNTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Account[];
  } catch {
    return [];
  }
}

async function saveAllAccounts(accounts: Account[]): Promise<void> {
  await SecureStore.setItemAsync(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function addAccount(data: AccountFormData): Promise<Account> {
  const existing = await getAllAccounts();
  const usedColors = existing.map((a) => a.color);

  const account: Account = {
    id: `acc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    imapHost: data.imapHost.trim(),
    imapPort: parseInt(data.imapPort, 10) || 993,
    smtpHost: data.smtpHost.trim(),
    smtpPort: parseInt(data.smtpPort, 10) || 465,
    color: getNextAccountColor(usedColors),
    createdAt: new Date().toISOString(),
  };

  await saveAllAccounts([...existing, account]);
  return account;
}

export async function updateAccount(id: string, data: AccountFormData): Promise<Account> {
  const existing = await getAllAccounts();
  const idx = existing.findIndex((a) => a.id === id);
  if (idx === -1) throw new Error('Account not found');

  const updated: Account = {
    ...existing[idx],
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    imapHost: data.imapHost.trim(),
    imapPort: parseInt(data.imapPort, 10) || 993,
    smtpHost: data.smtpHost.trim(),
    smtpPort: parseInt(data.smtpPort, 10) || 465,
  };

  existing[idx] = updated;
  await saveAllAccounts(existing);
  return updated;
}

export async function deleteAccount(id: string): Promise<void> {
  const existing = await getAllAccounts();
  await saveAllAccounts(existing.filter((a) => a.id !== id));
}

export { getAllAccounts };
