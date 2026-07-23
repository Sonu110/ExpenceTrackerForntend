'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownRight,
  Wallet,
  TrendingUp,
  Banknote,
  Filter,
  Calendar as CalendarIcon,
  ChevronDown,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { PageContainer } from '@/components/layout/page-container';
import { useSettingsStore } from '@/lib/store';
import {
  formatCurrency,
  getStartOfDay,
  getStartOfWeek,
  getStartOfMonth,
  getStartOfYear,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { getUserCategories } from '@/apiFasad/apiCalls/user';
import {
  deteleTransaction,
  getTransaction,
} from '@/apiFasad/apiCalls/userTransaction';
import { normalizeTransactions } from '@/lib/transformers';
import type { DateFilter, TransactionType } from '@/lib/types';

export default function TransactionsPage() {
  const { currency } = useSettingsStore();

  // State
  const [rawTransactions, setRawTransactions] = useState([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletLoad, setDeletLoading] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});

  // API Call
  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoryRes, transactionRes] = await Promise.all([
        getUserCategories(),
        getTransaction(),
      ]);

      setCategories(categoryRes?.data ?? []);
      setRawTransactions(transactionRes?.data ?? []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [deletLoad]);

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

  const transactions = useMemo(
    () => normalizeTransactions(rawTransactions),
    [rawTransactions]
  );

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        // Type filter
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && t.category_id !== categoryFilter) return false;

        // Date filter
        if (dateFilter === 'custom') {
          if (customRange.from) {
            const transDate = new Date(t.date).getTime();
            const start = new Date(customRange.from);
            start.setHours(0, 0, 0, 0);

            if (transDate < start.getTime()) return false;

            if (customRange.to) {
              const end = new Date(customRange.to);
              end.setHours(23, 59, 59, 999);
              if (transDate > end.getTime()) return false;
            }
          }
        } else if (dateFilter !== 'all') {
          const now = new Date();
          let start: Date;

          if (dateFilter === 'today') start = getStartOfDay(now);
          else if (dateFilter === 'week') start = getStartOfWeek(now);
          else if (dateFilter === 'month') start = getStartOfMonth(now);
          else if (dateFilter === 'year') start = getStartOfYear(now);
          else start = new Date(0);

          if (new Date(t.date) < start) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, typeFilter, categoryFilter, dateFilter, customRange]);

  // Summary stats calculations
  const stats = useMemo(() => {
    const totalIncome = filtered
      .filter((t) => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalExpense = filtered
      .filter((t) => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalInvestment = filtered
      .filter((t) => t.type === 'investment')
      .reduce((s, t) => s + Number(t.amount), 0);
    const netBalance = totalIncome - totalExpense - totalInvestment;

    return { totalIncome, totalExpense, totalInvestment, netBalance };
  }, [filtered]);

  return (
    <PageContainer
      title="Transactions"
      description="All your financial activity in one place"
      action={
        <HeaderTimeFilter
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          customRange={customRange}
          setCustomRange={setCustomRange}
        />
      }
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          <StatCard
            label="Income"
            amount={stats.totalIncome}
            icon={Banknote}
            color="text-sky-500"
            bg="bg-sky-500/10"
            prefix="+"
            currency={currency}
          />
          <StatCard
            label="Expense"
            amount={stats.totalExpense}
            icon={ArrowDownRight}
            color="text-red-500"
            bg="bg-red-500/10"
            prefix="-"
            currency={currency}
          />
          <StatCard
            label="Investment"
            amount={stats.totalInvestment}
            icon={TrendingUp}
            color="text-green-500"
            bg="bg-green-500/10"
            prefix="-"
            currency={currency}
          />
        </div>

        {/* Transactions Table Section */}
        <Card className="border-0 p-4 shadow-premium">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              {filtered.length} {filtered.length === 1 ? 'transaction' : 'transactions'}
            </h3>
            {dateFilter !== 'all' && (
              <Badge variant="secondary" className="gap-1">
                <Filter className="h-3 w-3" /> Filtered
              </Badge>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <TransactionsTable transactions={filtered} onDelete={handleDelete} />
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
        <Button variant="outline" className="gap-2 rounded-xl shadow-premium">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{getButtonLabel()}</span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-auto p-4 space-y-3">
        <div className="space-y-2">
          <Select
            value={dateFilter}
            onValueChange={(v) => setDateFilter(v as DateFilter)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>

          {dateFilter === 'custom' && (
            <div className="pt-2 border-t border-border mt-2">
              <Calendar
                mode="range"
                selected={{
                  from: customRange.from,
                  to: customRange.to,
                }}
                onSelect={(range) =>
                  setCustomRange({ from: range?.from, to: range?.to })
                }
              />
            </div>
          )}

          {dateFilter !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-destructive"
              onClick={() => {
                setDateFilter('all');
                setCustomRange({});
              }}
            >
              <X className="mr-1 h-3 w-3" /> Clear date filter
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
      <Card className="border-0 p-4 shadow-premium">
        <div className="flex items-center justify-between">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', bg, color)}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{label}</p>
        <p className={cn('text-lg font-bold', color)}>
          {prefix}
          {formatCurrency(amount, currency || 'INR')}
        </p>
      </Card>
    </motion.div>
  );
}