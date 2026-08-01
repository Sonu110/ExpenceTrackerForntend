'use client';

import { deteleTransaction, getTransaction, searchTransaction } from '@/apiFasad/apiCalls/userTransaction';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { PageContainer } from '@/components/layout/page-container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/format';
import { useSettingsStore } from '@/lib/store';
import { normalizeTransactions } from '@/lib/transformers';
import type { DateFilter, TransactionType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useDashboardStore } from '@/zustandStore/dashboard';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowDownRight, Banknote, Calendar as CalendarIcon, ChevronDown, Filter, TrendingUp, Wallet, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function TransactionsPage() {
  const { currency } = useSettingsStore();
  const refresh = useDashboardStore((state) => state.refresh);

  const [rawTransactions, setRawTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletLoad, setDeletLoading] = useState(false);

  // Filters — all now live here, drive the backend call
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('month');
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});

  const [page, setPage] = useState(0);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false });
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, totalInvestment: 0, netBalance: 0 });
  const [categoryTotals, setCategoryTotals] = useState<any[]>([]);

  // Debounce search: wait 350ms after typing stops before it affects the query
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        dateFilter,
        startDate: customRange.from,
        endDate: customRange.to,
        type: typeFilter,
        categoryId: categoryFilter,
        page,
        limit: 10,
      };

      const transactionRes = debouncedSearch ? await searchTransaction({ ...params, search: debouncedSearch }) : await getTransaction(params);

      setRawTransactions(transactionRes?.data ?? []);
      setPagination(transactionRes?.pagination ?? { total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false });
      setStats(transactionRes?.summary ?? { totalIncome: 0, totalExpense: 0, totalInvestment: 0, netBalance: 0 });
      setCategoryTotals(transactionRes?.categoryTotals ?? []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset to page 0 whenever any filter changes
  useEffect(() => {
    setPage(0);
  }, [dateFilter, customRange, typeFilter, categoryFilter, debouncedSearch]);

  // Fetch whenever page or any filter (or delete/refresh) changes
  useEffect(() => {
    fetchData();
  }, [deletLoad, dateFilter, customRange, typeFilter, categoryFilter, debouncedSearch, refresh, page]);

  const handleDelete = async (id: string) => {
    try {
      setDeletLoading(true);
      await deteleTransaction(id);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    } finally {
      setDeletLoading(false);
    }
  };

  const transactions = useMemo(() => normalizeTransactions(rawTransactions), [rawTransactions]);

  return (
    <PageContainer
      title='Transactions'
      description='All your financial activity in one place'
      action={<HeaderTimeFilter dateFilter={dateFilter} setDateFilter={setDateFilter} customRange={customRange} setCustomRange={setCustomRange} />}
    >
      <div className='space-y-6'>
        <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
          <StatCard
            label='Income'
            amount={stats.totalIncome}
            icon={Banknote}
            color='text-sky-500'
            bg='bg-sky-500/10'
            prefix='+'
            currency={currency}
          />
          <StatCard
            label='Expense'
            amount={stats.totalExpense}
            icon={ArrowDownRight}
            color='text-red-500'
            bg='bg-red-500/10'
            prefix='-'
            currency={currency}
          />
          <StatCard
            label='Investment'
            amount={stats.totalInvestment}
            icon={TrendingUp}
            color='text-green-500'
            bg='bg-green-500/10'
            prefix='-'
            currency={currency}
          />
        </div>

        <Card className='border-0 p-4 shadow-premium'>
          <div className='mb-4 flex items-center justify-between'>
            <h3 className='text-sm font-semibold'>
              {pagination.total} {pagination.total === 1 ? 'transaction' : 'transactions'}
            </h3>
            {dateFilter !== 'all' && (
              <Badge variant='secondary' className='gap-1'>
                <Filter className='h-3 w-3' /> Filtered
              </Badge>
            )}
          </div>

          {loading ? (
            <div className='space-y-3'>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className='h-12 w-full rounded-lg' />
              ))}
            </div>
          ) : (
            <TransactionsTable
              transactions={transactions}
              onDelete={handleDelete}
              categoriesData={categoryTotals}
              search={search}
              setSearch={setSearch}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
            />
          )}

          {!loading && pagination.totalPages > 1 && (
            <div className='mt-4 flex items-center justify-between'>
              <p className='text-xs text-muted-foreground'>
                Page {page + 1} of {pagination.totalPages} · {pagination.total} total
              </p>
              <div className='flex gap-2'>
                <Button variant='outline' size='sm' disabled={!pagination.hasPrevPage} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                  Previous
                </Button>
                <Button variant='outline' size='sm' disabled={!pagination.hasNextPage} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </PageContainer>
  );
}

/* Matching Header Time Filter Popover UI */
function HeaderTimeFilter({
  dateFilter,
  setDateFilter,
  customRange,
  setCustomRange,
}: {
  dateFilter: DateFilter;
  setDateFilter: (v: DateFilter) => void;
  customRange: { from?: Date; to?: Date };
  setCustomRange: (r: { from?: Date; to?: Date }) => void;
}) {
  const getButtonLabel = () => {
    if (dateFilter === 'custom') {
      if (customRange.from && customRange.to) {
        return `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d, yyyy')}`;
      }
      if (customRange.from) {
        return `From ${format(customRange.from, 'MMM d, yyyy')}`;
      }
      return 'Custom Range';
    }

    const labels: Record<DateFilter, string> = {
      all: 'All Time',
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      year: 'This Year',
      custom: 'Custom Range',
    };
    return labels[dateFilter] || 'All Time';
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' className='gap-2 rounded-xl shadow-premium'>
          <CalendarIcon className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-medium'>{getButtonLabel()}</span>
          <ChevronDown className='h-4 w-4 opacity-60' />
        </Button>
      </PopoverTrigger>

      <PopoverContent align='end' className='w-auto p-4 space-y-3'>
        <div className='space-y-2'>
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Time</SelectItem>
              <SelectItem value='today'>Today</SelectItem>
              <SelectItem value='week'>This Week</SelectItem>
              <SelectItem value='month'>This Month</SelectItem>
              <SelectItem value='year'>This Year</SelectItem>
              <SelectItem value='custom'>Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {dateFilter === 'custom' && (
            <div className='pt-2 border-t border-border mt-2'>
              <Calendar
                mode='range'
                selected={{
                  from: customRange.from,
                  to: customRange.to,
                }}
                onSelect={(range) => setCustomRange({ from: range?.from, to: range?.to })}
              />
            </div>
          )}

          {dateFilter !== 'all' && (
            <Button
              variant='ghost'
              size='sm'
              className='w-full text-xs text-muted-foreground hover:text-destructive'
              onClick={() => {
                setDateFilter('all');
                setCustomRange({});
              }}
            >
              <X className='mr-1 h-3 w-3' /> Clear date filter
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/* StatCard Helper Component */
function StatCard({
  label,
  amount,
  icon: Icon,
  color,
  bg,
  prefix,
  currency,
}: {
  label: string;
  amount: number;
  icon: typeof Wallet;
  color: string;
  bg: string;
  prefix?: string;
  currency?: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Card className='border-0 p-4 shadow-premium'>
        <div className='flex items-center justify-between'>
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', bg, color)}>
            <Icon className='h-4 w-4' />
          </div>
        </div>
        <p className='mt-3 text-xs text-muted-foreground'>{label}</p>
        <p className={cn('text-lg font-bold', color)}>
          {prefix}
          {formatCurrency(amount, currency || 'INR')}
        </p>
      </Card>
    </motion.div>
  );
}
