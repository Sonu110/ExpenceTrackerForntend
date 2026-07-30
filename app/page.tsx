"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  ChevronDown,
  Receipt,
  ArrowLeftRight,
  FolderOpen,
} from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { Charts } from "@/components/dashboard/charts";
import { CategoryProgress } from "@/components/dashboard/category-progress";
import { TransactionsTable } from "@/components/dashboard/transactions-table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TransactionType } from "@/lib/types";
import { useAuthStore } from "@/zustandStore/login";
import { deteleTransaction } from "@/apiFasad/apiCalls/userTransaction";
import { normalizeTransactions } from "@/lib/transformers";
import { getUserThisMonthData } from "@/apiFasad/apiCalls/user";
import { useDashboardStore } from "@/zustandStore/dashboard";

type TypeFilter = "all" | TransactionType;

export default function DashboardPage() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [deletLoad, setDeletLoading] = useState(false);
const refresh = useDashboardStore((state) => state.refresh);

  const user = useAuthStore((s) => s.user);

  const handleDelete = async (id: string) => {
    try {
      setDeletLoading(true);
      await deteleTransaction(id);
    } catch (error) {
      console.error("Failed to delete transaction", error);
    } finally {
      setDeletLoading(false); // triggers refetch via the effect below
    }
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getUserThisMonthData();
      setDashboard(res?.data ?? null);
    } catch (error) {
      console.error("Dashboard fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [deletLoad,refresh]);

  // The 5 recent transactions the backend already scoped to this month.
  // normalizeTransactions keeps the shape the table/component expect.
  const recentTransactions = useMemo(
    () => normalizeTransactions(dashboard?.recentTransactions ?? []),
    [dashboard],
  );

  const filteredRecent = useMemo(() => {
    if (typeFilter === "all") return recentTransactions;
    return recentTransactions.filter((t) => t.type === typeFilter);
  }, [recentTransactions, typeFilter]);

  const totalBudget = user?.monthlyBudget;
  const summary = dashboard?.summary ?? {
    totalExpense: 0,
    totalIncome: 0,
    totalInvestment: 0,
  };
  const remainingBudget = Math.max(
    0,
    (totalBudget ?? 0) - (summary.totalExpense + summary.totalInvestment),
  );

  if (loading) {
    return (
      <PageContainer
        title={user?.username ? `${user.username.toUpperCase()}` : "Dashboard"}
        description="Track your Finance of this Month "
        action={<HeaderActions />}
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-5">
            {[...Array(5)].map((_, i) => (
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
      title={user?.username ? `${user.username.toUpperCase()}` : "Dashboard"}
      description="Track your Finance of this Month "
      action={
        <HeaderActions typeFilter={typeFilter} setTypeFilter={setTypeFilter} />
      }
    >
      <div className="space-y-6">
        <SummaryCards
          totalExpense={summary.totalExpense}
          totalInvestment={summary.totalInvestment}
          totalIncome={summary.totalIncome}
          remainingBudget={remainingBudget}
          totalBudget={totalBudget}
        />
        {/* chartData is already aggregated per-day for this month:
            [{ date, income, expense, investment }, ...] */}
        <Charts
          categories={dashboard?.categories ?? []}
          chartData={dashboard?.chartData ?? []}
          typeFilter={typeFilter}
        />{" "}
        {/* categories already include totalAmountSpend for this month */}
        {typeFilter !== "investment" && (
          <CategoryProgress
            categories={dashboard?.categories ?? []}
            transactions={filteredRecent}
            type="All"
          />
        )}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Recent Transactions</h2>
          <TransactionsTable
            transactions={filteredRecent}
            recent={true}
            onDelete={handleDelete}
          />
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
      {typeFilter !== undefined && setTypeFilter && (
        <TypeFilterDropdown value={typeFilter} onChange={setTypeFilter} />
      )}
      <Link href="/settings">
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl shadow-premium md:hidden"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}

function TypeFilterDropdown({
  value,
  onChange,
}: {
  value: TypeFilter;
  onChange: (v: TypeFilter) => void;
}) {
  const router = useRouter();
  const options: { value: TypeFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "expense", label: "Expense" },
    { value: "income", label: "Income" },
    { value: "investment", label: "Investment" },
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
              "flex items-center justify-between",
              value === opt.value && "font-semibold text-primary",
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
          onClick={() => router.push("/receipts")}
          className="flex items-center gap-2"
        >
          <Receipt className="h-4 w-4" />
          Receipts
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/categories")}
          className="flex items-center gap-2"
        >
          <FolderOpen className="h-5 w-5" />
          Categories
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
