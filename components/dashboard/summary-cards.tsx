'use client';

import { motion } from 'framer-motion';
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  CalendarDays,
  Banknote,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { formatCurrency } from '@/lib/format';
import { useSettingsStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  gradient: string;
  iconBg: string;
  delay?: number;
  subtitle?: string;
}

function SummaryCard({
  title,
  amount,
  icon: Icon,
  gradient,
  iconBg,
  delay = 0,
  subtitle,
}: SummaryCardProps) {
  const { currency } = useSettingsStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="relative h-full overflow-hidden border border-border/50 bg-card shadow-sm">
        {/* Soft background gradient tint */}
        <div className={cn('absolute inset-0 opacity-10 pointer-events-none', gradient)} />

        <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {/* Card Title */}
              <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-snug">
                {title}
              </p>

              {/* Card Amount - Ensures text color is explicitly white/black */}
              <p className="mt-1.5 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white break-words">
                {formatCurrency(amount ?? 0, currency)}
              </p>

              {subtitle && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Icon Wrapper */}
            <div
              className={cn(
                'flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl',
                iconBg
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

interface SummaryCardsProps {
  totalExpense: number;
  totalInvestment: number;
  totalIncome: number;
  remainingBudget: number;
  totalBudget: number;
}

export function SummaryCards({
  totalExpense,
  totalInvestment,
  totalIncome,
  remainingBudget,
  totalBudget,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 items-stretch">
      <SummaryCard
        title="Total Expense"
        amount={totalExpense}
        icon={TrendingDown}
        gradient="bg-red-500"
        iconBg="bg-red-500/10 text-red-500"
        delay={0}
      />
      <SummaryCard
        title="Total Income"
        amount={totalIncome}
        icon={Banknote}
        gradient="bg-sky-500"
        iconBg="bg-sky-500/10 text-sky-500"
        delay={0.05}
      />
      <SummaryCard
        title="Total Investment"
        amount={totalInvestment}
        icon={TrendingUp}
        gradient="bg-green-500"
        iconBg="bg-green-500/10 text-green-500"
        delay={0.1}
      />
      <SummaryCard
        title="Remaining Budget"
        amount={remainingBudget}
        icon={Wallet}
        gradient="bg-blue-500"
        iconBg="bg-blue-500/10 text-blue-500"
        delay={0.15}
      />
      <SummaryCard
        title="Monthly Budget"
        amount={totalBudget}
        icon={Wallet}
        gradient="bg-emerald-500"
        iconBg="bg-emerald-500/10 text-emerald-500"
        delay={0.25}
      />
    </div>
  );
}
