'use client';

import { DynamicIcon } from '@/components/dynamic-icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/format';
import { useSettingsStore } from '@/lib/store';
import { normalizeTransactions, type RawTransaction } from '@/lib/transformers';
import type { PaymentMethod, SortDirection, SortField, TransactionType, TransactionWithCategory } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, ArrowUpDown, CreditCard, Search, Smartphone, Trash2, Wallet, X } from 'lucide-react';
import { useMemo, useState } from 'react';

interface TransactionsTableProps {
  onDelete: (id: string) => void;
  recent?: boolean;
  transactions: (TransactionWithCategory | RawTransaction)[];
  categoriesData: any[];
  search: string;
  setSearch: (v: string) => void;
  typeFilter: 'all' | TransactionType;
  setTypeFilter: (v: 'all' | TransactionType) => void;
  categoryFilter: string;
  setCategoryFilter: (v: string) => void;
}

export function TransactionsTable({
  transactions: rawInput,
  onDelete,
  recent = false,
  categoriesData,
  search,
  setSearch,
  typeFilter,
  setTypeFilter,
  categoryFilter,
  setCategoryFilter,
}: TransactionsTableProps) {
  const { currency } = useSettingsStore();

  const transactions = useMemo(() => normalizeTransactions(rawInput), [rawInput]);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDirection>('desc');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map();
    categoriesData?.forEach((item) => {
      map.set(item.categoryId, item.name);
    });
    return [...map.entries()].map(([id, name]) => ({ id, name }));
  }, [categoriesData]);

  // Sorting only. Search/type/category/date filtering already happened on the
  // backend, and pagination already sliced this down to the current page.
  // NOTE: sorting here only re-orders the current page's rows. True cross-page
  // sorting would need sortField/sortDir sent to the backend as query params.
  const sorted = useMemo(() => applySort([...transactions], sortField, sortDir), [transactions, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className='h-3 w-3 opacity-40' />;
    return sortDir === 'asc' ? <ArrowUp className='h-3 w-3' /> : <ArrowDown className='h-3 w-3' />;
  };

  return (
    <>
      <Card className='border-0 shadow-premium'>
        {/* Toolbar */}
        {!recent && (
          <div className='flex flex-col gap-3 border-b border-border p-4'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder='Search transactions...' className='pl-9' />
              </div>
              <div className='flex gap-2'>
                <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
                  <SelectTrigger className='w-[120px]'>
                    <SelectValue placeholder='Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='expense'>Expense</SelectItem>
                    <SelectItem value='investment'>Investment</SelectItem>
                    <SelectItem value='income'>Income</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Category' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(search || typeFilter !== 'all' || categoryFilter !== 'all') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      setSearch('');
                      setTypeFilter('all');
                      setCategoryFilter('all');
                    }}
                  >
                    <X className='mr-1 h-3 w-3' /> Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Table - Desktop */}
        <div className='hidden overflow-x-auto md:block'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-border'>
                <th className='px-4 py-3 text-left font-medium text-muted-foreground'>
                  <button onClick={() => handleSort('date')} className='flex items-center gap-1 hover:text-foreground'>
                    Date <SortIcon field='date' />
                  </button>
                </th>
                <th className='px-4 py-3 text-left font-medium text-muted-foreground'>Type</th>
                <th className='px-4 py-3 text-left font-medium text-muted-foreground'>Category</th>
                <th className='px-4 py-3 text-left font-medium text-muted-foreground'>
                  <button onClick={() => handleSort('item_name')} className='flex items-center gap-1 hover:text-foreground'>
                    Item <SortIcon field='item_name' />
                  </button>
                </th>
                <th className='px-4 py-3 text-right font-medium text-muted-foreground'>
                  <button onClick={() => handleSort('amount')} className='flex items-center gap-1 hover:text-foreground'>
                    Amount <SortIcon field='amount' />
                  </button>
                </th>
                <th className='px-4 py-3 text-center font-medium text-muted-foreground'>Receipt</th>
                <th className='px-4 py-3 text-center font-medium text-muted-foreground'>Paid via</th>
                <th className='px-4 py-3 text-center font-medium text-muted-foreground'>Delete</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {sorted.map((t, i) => (
                  <motion.tr
                    key={t._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className='border-b border-border/50 transition-colors hover:bg-muted/30'
                  >
                    <td className='px-4 py-3 text-muted-foreground'>{formatDate(t.date)}</td>
                    <td className='px-4 py-3'>
                      <Badge variant={t.type === 'expense' ? 'destructive' : 'default'} className='capitalize'>
                        {t.type}
                      </Badge>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center gap-2'>
                        <div
                          className='flex h-7 w-7 items-center justify-center rounded-lg'
                          style={{
                            backgroundColor: `${t.category.color}20`,
                            color: t.category.color,
                          }}
                        >
                          <DynamicIcon name={t.category.icon} className='h-3.5 w-3.5' />
                        </div>
                        <span>{t.category.name}</span>
                      </div>
                    </td>
                    <td className='px-4 py-3 font-medium'>{t.item_name}</td>
                    <td className={cn('px-4 py-3 text-right font-semibold', t.type === 'expense' ? 'text-red-500' : 'text-green-500')}>
                      {t.type === 'expense' ? '-' : '+'}
                      {formatCurrency(Number(t.amount), currency)}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      {t.receipt_url ? (
                        <button
                          onClick={() => setPreviewImage(`${process.env.NEXT_PUBLIC_API_URL!}${t.receipt_url?.imageUrl}`)}
                          className='inline-flex'
                        >
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL!}${t.receipt_url?.imageUrl}`}
                            alt='Receipt'
                            className='h-10 w-10 rounded-lg object-cover ring-1 ring-border'
                          />
                        </button>
                      ) : (
                        <span className='text-muted-foreground/40'>—</span>
                      )}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <PaymentMethodBadge method={t.payment_method} />
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <Button variant='destructive' className='flex-1' onClick={() => onDelete(t._id)}>
                        Delete
                      </Button>
                    </td>

                    <td className='px-4 py-3 text-center'></td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {sorted.length === 0 && <div className='py-12 text-center text-sm text-muted-foreground'>No transactions found</div>}
        </div>

        {/* Mobile cards */}
        <div className='space-y-2 p-3 md:hidden'>
          <AnimatePresence>
            {sorted.map((t) => (
              <motion.div
                key={t?._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className='rounded-xl border border-border p-3'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-2'>
                    <div
                      className='flex h-9 w-9 items-center justify-center rounded-lg'
                      style={{
                        backgroundColor: `${t.category.color}20`,
                        color: t.category.color,
                      }}
                    >
                      <DynamicIcon name={t.category.icon} className='h-4 w-4' />
                    </div>
                    <div>
                      <p className='text-sm font-medium'>{t.item_name}</p>
                      <p className='text-xs text-muted-foreground'>
                        {t.category.name} · {formatDate(t.date)}
                      </p>
                      <div className='mt-0.5 flex items-center gap-1 text-xs text-muted-foreground'>
                        <PaymentMethodBadge method={t.payment_method} compact />
                      </div>
                    </div>
                  </div>
                  <div className='text-right'>
                    <div className='flex flex-col items-end justify-end'>
                      <p className={cn('text-sm font-semibold', t.type === 'expense' ? 'text-red-500' : 'text-green-500')}>
                        {t.type === 'expense' ? '-' : '+'}
                        {formatCurrency(Number(t.amount), currency)}
                      </p>
                      <div
                        onClick={() => onDelete(t._id)}
                        className='mt-3 mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10'
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </div>
                    </div>

                    {t.receipt_url && (
                      <button onClick={() => setPreviewImage(t.receipt_url)} className='mt-1 inline-flex'>
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL!}${t.receipt_url?.imageUrl}`}
                          alt='Receipt'
                          className='h-8 w-8 rounded object-cover'
                        />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {sorted.length === 0 && <div className='py-12 text-center text-sm text-muted-foreground'>No transactions found</div>}
        </div>
      </Card>

      {/* Image preview dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className='max-w-md p-0'>
          <DialogTitle className='sr-only'>Receipt preview</DialogTitle>
          {previewImage && <img src={previewImage} alt='Receipt' className='w-full rounded-lg' />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function PaymentMethodBadge({ method, compact = false }: { method: PaymentMethod; compact?: boolean }) {
  const config = {
    cash: {
      icon: Wallet,
      label: 'Cash',
      cls: 'bg-amber-500/10 text-amber-600',
    },
    card: {
      icon: CreditCard,
      label: 'Card',
      cls: 'bg-blue-500/10 text-blue-600',
    },
    upi: {
      icon: Smartphone,
      label: 'UPI',
      cls: 'bg-violet-500/10 text-violet-600',
    },
  };
  const { icon: Icon, label, cls } = config[method];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', cls)}>
      <Icon className='h-3 w-3' />
      {compact ? label : <span className='capitalize'>{label}</span>}
    </span>
  );
}

function applySort(arr: TransactionWithCategory[], field: SortField, dir: SortDirection): TransactionWithCategory[] {
  return arr.sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;
    if (field === 'category') {
      aVal = a.category.name;
      bVal = b.category.name;
    } else if (field === 'amount') {
      aVal = Number(a.amount);
      bVal = Number(b.amount);
    } else if (field === 'date') {
      aVal = new Date(a.date).getTime();
      bVal = new Date(b.date).getTime();
    } else {
      aVal = a[field];
      bVal = b[field];
    }
    if (aVal < bVal) return dir === 'asc' ? -1 : 1;
    if (aVal > bVal) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}
