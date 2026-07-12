import type { TransactionWithCategory, PaymentMethod } from '@/lib/types';

// ---- Raw shape coming straight from your API / MongoDB ----
export interface RawTransaction {
  _id: string;
  userId: string;
  categoryId: {
    _id: string;
    name: string;
    type: 'expense' | 'investment';
    icon: string;
    color: string;
    monthlyBudget: number | null;
  };
  type: 'expense' | 'investment';
  title: string;
  amount: number;
  note: string | null;
  paymentMethod: PaymentMethod;
  receiptId: string | null;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
}

export function isRawTransaction(t: unknown): t is RawTransaction {
  return (
    !!t &&
    typeof t === 'object' &&
    (t as RawTransaction).categoryId !== undefined &&
    (t as RawTransaction).title !== undefined
  );
}

export function normalizeTransaction(raw: RawTransaction): TransactionWithCategory {
  return {
    _id: raw._id,
    type: raw.type,
    item_name: raw.title,
    amount: raw.amount,
    date: raw.transactionDate,
    payment_method: raw.paymentMethod,
    receipt_url: raw.receiptId ?? null, // swap for a resolved file URL once uploads are wired up
    status: 'completed', // raw data has no status field yet — defaulting until backend adds one
    category_id: raw.categoryId?._id,
    category: {
      name: raw.categoryId?.name,
      color: raw.categoryId?.color,
      icon: raw.categoryId?.icon,
    },
  };
}

// Accepts a mixed list (raw docs and/or already-normalized items) and returns
// a clean, consistent TransactionWithCategory[] every time.
export function normalizeTransactions(
  list: (RawTransaction | TransactionWithCategory)[] | undefined | null
): TransactionWithCategory[] {
  if (!list) return [];
  return list.map((t) => (isRawTransaction(t) ? normalizeTransaction(t) : (t as TransactionWithCategory)));
}