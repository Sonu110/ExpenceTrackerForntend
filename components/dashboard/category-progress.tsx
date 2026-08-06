'use client';

import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { DynamicIcon } from '@/components/dynamic-icon';
import { formatCurrency } from '@/lib/format';
import { useSettingsStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Category, TransactionWithCategory } from '@/lib/types';

interface CategoryProgressProps {
  categories: Category[];
  transactions: TransactionWithCategory[];
  type: string;
}

export function CategoryProgress({ categories, transactions, type = 'All' }: CategoryProgressProps) {
  const { currency } = useSettingsStore();

  const filteredCategories = type === 'All' ? categories : categories.filter((c) => c.type === type);

  const getProgressColor = (amount: number, limit: number, categoryType: string) => {
    const pct = (amount / limit) * 100;

    // Income UI
    if (categoryType === 'income') {
      if (pct >= 100)
        return {
          bar: 'bg-green-600',
          text: 'text-green-600',
          label: 'Goal Reached',
        };

      if (pct >= 80)
        return {
          bar: 'bg-emerald-500',
          text: 'text-emerald-500',
          label: 'Near Goal',
        };

      return {
        bar: 'bg-sky-500',
        text: 'text-sky-500',
        label: 'In Progress',
      };
    }

    // Expense UI
    if (pct >= 100)
      return {
        bar: 'bg-red-500',
        text: 'text-red-500',
        label: 'Limit Reached',
      };

    if (pct >= 80)
      return {
        bar: 'bg-yellow-500',
        text: 'text-yellow-500',
        label: 'Near Limit',
      };

    return {
      bar: 'bg-green-500',
      text: 'text-green-500',
      label: 'Safe',
    };
  };

  if (filteredCategories.length === 0) return null;

  return (
    <Card className='border-0 p-5 shadow-premium'>
      <h3 className='mb-5 text-sm font-semibold'>
        {type === 'income' ? 'Income Goal Progress' : type === 'expense' ? 'Expense Budget Progress' : 'Category Progress'}
      </h3>

      <div className='space-y-5'>
        {filteredCategories.map((cat, i) => {
          const amount = Number(cat.totalAmountSpend ?? 0);
          const limit = cat.monthlyBudget;

          const percentage = limit ? Math.min((amount / limit) * 100, 100) : 0;

          const colors = limit
            ? getProgressColor(amount, limit, cat.type)
            : {
                bar: 'bg-primary',
                text: 'text-muted-foreground',
                label: 'Unlimited',
              };

          const isIncome = cat.type === 'income';
          const reached = limit ? amount >= limit : false;

          return (
            <motion.div
              key={cat._id || cat.id}
              initial={{
                opacity: 0,
                x: -20,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                delay: i * 0.05,
              }}
            >
              {/* Header */}
              <div className='mb-2 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div
                    className='flex h-9 w-9 items-center justify-center rounded-xl'
                    style={{
                      backgroundColor: `${cat.color}20`,
                      color: cat.color,
                    }}
                  >
                    <DynamicIcon name={cat.icon} className='h-4.5 w-4.5' />
                  </div>

                  <div>
                    <p className='text-sm font-medium'>{cat.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      {cat.type === 'income' ? 'Income Target' : cat.type === 'investment' ? 'Investment' : 'Expense Budget'}
                    </p>{' '}
                  </div>
                </div>

                {limit == null ? (
                  <span className='text-sm font-medium text-muted-foreground'>Unlimited</span>
                ) : (
                  <div className='text-right'>
                    <p className='text-sm font-semibold'>
                      {formatCurrency(amount, currency)}
                      {' / '}
                      {formatCurrency(limit, currency)}
                    </p>

                    <span className={cn('text-xs font-medium', colors.text)}>{Math.round(percentage)}%</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}

              {limit != null && (
                <>
                  <div className='h-3 w-full overflow-hidden rounded-full bg-muted'>
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${percentage}%`,
                      }}
                      transition={{
                        delay: i * 0.05 + 0.2,
                        duration: 0.7,
                        ease: 'easeOut',
                      }}
                      className={cn('h-full rounded-full', colors.bar)}
                    />
                  </div>

                  {/* Status */}

                  <div className={cn('mt-2 flex items-center gap-1 text-xs', colors.text)}>
                    {reached && (isIncome ? <TrendingUp className='h-3.5 w-3.5' /> : <AlertTriangle className='h-3.5 w-3.5' />)}

                    <span>{colors.label}</span>

                    {isIncome && reached && <span className='ml-1 font-medium'>+{formatCurrency(amount - limit, currency)} extra earned</span>}

                    {!isIncome && reached && <span className='ml-1 font-medium'>Over by {formatCurrency(amount - limit, currency)}</span>}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
