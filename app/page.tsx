'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, ChevronDown, Receipt } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { Charts } from '@/components/dashboard/charts';
import { CategoryProgress } from '@/components/dashboard/category-progress';
import { TransactionsTable } from '@/components/dashboard/transactions-table';
import { getStartOfMonth } from '@/lib/format';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { TransactionType } from '@/lib/types';
import { useAuthStore } from '@/zustandStore/login';
import { getUserCategories } from '@/apiFasad/apiCalls/user';
import { deteleTransaction, getTransaction } from '@/apiFasad/apiCalls/userTransaction';
import { normalizeTransactions } from '@/lib/transformers';


type TypeFilter = 'all' | TransactionType;

export default function DashboardPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categories, setUserCategories] = useState([]);
  const [rawTransactions, setRawTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletLoad, setDeletLoading] = useState(false);
  
  const user = useAuthStore((s) => s.user);
  console.log(user);
  
  const handleDelete = async(id:string)=>{
    try {
      setDeletLoading(true);
      const res = await deteleTransaction(id)
    } catch (error) {
      
    }
    finally {
      setDeletLoading(false);
    }

  }
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const data = await getUserCategories();
      const transactionData = await getTransaction();

      setRawTransactions(transactionData?.data ?? []);
      setUserCategories(data?.data ?? []);
    } catch (error) {
      console.error('Category fetch error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [deletLoad]);




  // Normalize once here — raw MongoDB transaction docs (categoryId as object,
  // `title`, `transactionDate`, `paymentMethod`) become a flat, consistent
  // shape (`item_name`, `date`, `payment_method`, `category`) that every
  // child component (table, charts, stats) can rely on.
  const transactions = useMemo(() => normalizeTransactions(rawTransactions), [rawTransactions]);

  const filteredTransactions = useMemo(() => {
    if (typeFilter === 'all') return transactions;
    return transactions.filter((t) => t.type === typeFilter);
  }, [transactions, typeFilter]);

  const stats = useMemo(() => {
    const totalExpense = filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalInvestment = filteredTransactions
      .filter((t) => t.type === 'investment')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const monthStart = getStartOfMonth();
    const thisMonthSpending =user?.monthlyBudget

    // NOTE: category docs use `monthlyBudget`, not `budget_limit` — fixed here.
    const totalBudget = user?.monthlyBudget

    const remainingBudget = Math.max(0, totalBudget - (totalExpense+totalInvestment));

    return { totalExpense, totalInvestment, thisMonthSpending, remainingBudget };
  }, [filteredTransactions, categories]);

  if (loading) {
    return (
      <PageContainer
        title={`${user?.username}`}
        description="Track your expenses and investments"
        action={<HeaderActions />}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={`${user?.username.toUpperCase()} `}
      description="Track your expenses and investments"
      action={<HeaderActions typeFilter={typeFilter} setTypeFilter={setTypeFilter} />}
    >
      <div className="space-y-6">
        <SummaryCards
          totalExpense={stats.totalExpense}
          totalInvestment={stats.totalInvestment}
          remainingBudget={stats.remainingBudget}
          thisMonthSpending={stats.thisMonthSpending}
        />

        {/* Real transactions (with dates) now go into Charts, so the
            weekly/monthly/yearly toggle actually filters the data. */}
        <Charts transactions={filteredTransactions} />

        {typeFilter !== 'investment' && (
          <CategoryProgress categories={categories} transactions={filteredTransactions} type={"All"} />
        )}

        <div>
          <h2 className="mb-3 text-lg font-semibold">Recent Transactions</h2>
          <TransactionsTable transactions={filteredTransactions} onDelete={handleDelete} />
        </div>
      </div>
    </PageContainer>
  );
}

function HeaderActions({
  typeFilter,
  setTypeFilter,
}: {
  typeFilter?: TypeFilter;
  setTypeFilter?: (v: TypeFilter) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {typeFilter !== undefined && setTypeFilter && <TypeFilterDropdown value={typeFilter} onChange={setTypeFilter} />}
      <Link href="/settings">
        <Button variant="outline" size="icon" className="rounded-xl shadow-premium md:hidden">
          <Settings className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}

function TypeFilterDropdown({ value, onChange }: { value: TypeFilter; onChange: (v: TypeFilter) => void }) {
  const router = useRouter();
  const options: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'expense', label: 'Expense' },
    { value: 'investment', label: 'Investment' },
  ];
  const current = options.find((o) => o.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-1.5 rounded-xl shadow-premium">
          <span className="text-sm font-medium">{current?.label}</span>
          <ChevronDown className="h-4 w-4 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex items-center justify-between',
              value === opt.value && 'font-semibold text-primary'
            )}
          >
            {opt.label}
            {value === opt.value && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="h-2 w-2 rounded-full bg-primary"
              />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/receipts')}
          className="flex items-center gap-2"
        >
          <Receipt className="h-4 w-4" />
          Receipts
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}