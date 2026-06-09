import type { BillingCycle } from '../types';

export function getNextRenewalDate(dateStr: string, billingCycle: BillingCycle): Date {
  // Parse as local date (avoid UTC offset shifting the day)
  const [y, m, d] = dateStr.split('-').map(Number);
  const base = new Date(y, m - 1, d);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (billingCycle === 'monthly') {
    const day = base.getDate();
    let candidate = new Date(today.getFullYear(), today.getMonth(), day);
    if (candidate < today) {
      candidate = new Date(today.getFullYear(), today.getMonth() + 1, day);
    }
    return candidate;
  }

  // yearly
  const month = base.getMonth();
  const day = base.getDate();
  let candidate = new Date(today.getFullYear(), month, day);
  if (candidate < today) {
    candidate = new Date(today.getFullYear() + 1, month, day);
  }
  return candidate;
}

export function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
