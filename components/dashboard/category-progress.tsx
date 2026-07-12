'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { DynamicIcon } from '@/components/dynamic-icon';
import { formatCurrency } from '@/lib/format';
import { useSettingsStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Category, TransactionWithCategory } from '@/lib/types';

interface CategoryProgressProps {
  categories: Category[];
  transactions: TransactionWithCategory[];
  type:string
}

export function CategoryProgress({ categories, transactions  , type='All'}: CategoryProgressProps) {
  const { currency } = useSettingsStore();
  const expenseCategories = type=='All'? categories: categories.filter((c) => c.type === type );
console.log(expenseCategories);
console.log(categories);



  const getProgressColor = (spent: number, limit: number) => {
    const pct = (spent / limit) * 100;
    if (pct >= 100) return { bar: 'bg-red-500', text: 'text-red-500', label: 'Limit Reached' };
    if (pct >= 80) return { bar: 'bg-yellow-500', text: 'text-yellow-500', label: 'Near Limit' };
    return { bar: 'bg-green-500', text: 'text-green-500', label: 'Safe' };
  };

  if (expenseCategories.length === 0) return null;

 return (
  <Card className="border-0 p-5 shadow-premium">
    <h3 className="mb-4 text-sm font-semibold">Category Budget Progress</h3>

    <div className="space-y-4">
      {expenseCategories.map((cat, i) => {
        const spent = Number(cat.totalAmountSpend ?? 0);
        const limit = cat.monthlyBudget;

        const pct = limit ? Math.min((spent / limit) * 100, 100) : 0;
        const colors = limit
          ? getProgressColor(spent, limit)
          : { text: "text-muted-foreground", bar: "bg-primary", label: "Unlimited" };

        return (
          <motion.div
            key={cat._id || cat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${cat.color}20`,
                    color: cat.color,
                  }}
                >
                  <DynamicIcon name={cat.icon} className="h-4 w-4" />
                </div>

                <span className="text-sm font-medium">{cat.name}</span>
              </div>

              {limit == null ? (
                <span className="text-sm font-medium text-muted-foreground ">
                  Unlimited
                </span>
              ) : (
                <div className="text-right">
                  <span className="text-sm font-medium">
                    {formatCurrency(spent, currency)} /{" "}
                    {formatCurrency(limit, currency)}
                  </span>

                  <span className={cn("ml-2 text-xs font-medium", colors.text)}>
                    {Math.round(pct)}%
                  </span>
                </div>
              )}
            </div>

            {limit != null && (
              <>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      delay: i * 0.05 + 0.2,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    className={cn("h-full rounded-full", colors.bar)}
                  />
                </div>

                <p className={cn("mt-1 text-xs", colors.text)}>
                  {colors.label}
                </p>
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  </Card>
);
}
