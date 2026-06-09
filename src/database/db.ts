import { Platform } from 'react-native';
import type { Subscription, BillingCycle } from '../types';

// ─── Pricing helpers ──────────────────────────────────────────────────────────

export function getMonthlyPrice(price: number, cycle: BillingCycle): number {
  return cycle === 'yearly' ? price / 12 : price;
}

export function getYearlyPrice(price: number, cycle: BillingCycle): number {
  return cycle === 'monthly' ? price * 12 : price;
}

// ─── Web fallback: localStorage ───────────────────────────────────────────────

const WEB_KEY = 'wallet_subscriptions_v1';
let _webIdCounter = 0;

function webLoad(): Subscription[] {
  try {
    const raw = localStorage.getItem(WEB_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Subscription[];
    if (parsed.length > 0) {
      _webIdCounter = Math.max(...parsed.map((s) => s.id));
    }
    return parsed;
  } catch {
    return [];
  }
}

function webSave(subs: Subscription[]): void {
  localStorage.setItem(WEB_KEY, JSON.stringify(subs));
}

// ─── Native: expo-sqlite ──────────────────────────────────────────────────────

let _db: import('expo-sqlite').SQLiteDatabase | null = null;

async function getNativeDb() {
  const SQLite = await import('expo-sqlite');
  if (!_db) {
    _db = await SQLite.openDatabaseAsync('wallet.db');
    await _db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        billing_cycle TEXT NOT NULL DEFAULT 'monthly',
        renewal_date TEXT NOT NULL,
        brand_id TEXT,
        brand_color TEXT NOT NULL DEFAULT '#7B6EF6',
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);
  }
  return _db;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getAllSubscriptions(): Promise<Subscription[]> {
  if (Platform.OS === 'web') {
    return webLoad().sort(
      (a, b) => new Date(a.renewal_date).getTime() - new Date(b.renewal_date).getTime()
    );
  }
  const db = await getNativeDb();
  return db.getAllAsync<Subscription>(
    'SELECT * FROM subscriptions ORDER BY renewal_date ASC'
  );
}

export async function addSubscription(
  sub: Omit<Subscription, 'id' | 'created_at'>
): Promise<number> {
  if (Platform.OS === 'web') {
    const subs = webLoad();
    const id = ++_webIdCounter;
    subs.push({ ...sub, id, created_at: new Date().toISOString() });
    webSave(subs);
    return id;
  }
  const db = await getNativeDb();
  const result = await db.runAsync(
    'INSERT INTO subscriptions (name, price, billing_cycle, renewal_date, brand_id, brand_color) VALUES (?, ?, ?, ?, ?, ?)',
    [sub.name, sub.price, sub.billing_cycle, sub.renewal_date, sub.brand_id, sub.brand_color]
  );
  return result.lastInsertRowId;
}

export async function updateSubscription(
  id: number,
  sub: Omit<Subscription, 'id' | 'created_at'>
): Promise<void> {
  if (Platform.OS === 'web') {
    const subs = webLoad().map((s) =>
      s.id === id ? { ...s, ...sub } : s
    );
    webSave(subs);
    return;
  }
  const db = await getNativeDb();
  await db.runAsync(
    'UPDATE subscriptions SET name=?, price=?, billing_cycle=?, renewal_date=?, brand_id=?, brand_color=? WHERE id=?',
    [sub.name, sub.price, sub.billing_cycle, sub.renewal_date, sub.brand_id, sub.brand_color, id]
  );
}

export async function deleteSubscription(id: number): Promise<void> {
  if (Platform.OS === 'web') {
    webSave(webLoad().filter((s) => s.id !== id));
    return;
  }
  const db = await getNativeDb();
  await db.runAsync('DELETE FROM subscriptions WHERE id=?', [id]);
}
