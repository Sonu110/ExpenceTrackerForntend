'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { formatCurrencyShort, formatCurrency } from '@/lib/format';
import { useSettingsStore } from '@/lib/store';
import { format } from 'date-fns';

interface DashboardCategory {
  _id: string;
  name: string;
  color: string;
  type: 'expense' | 'income' | 'investment';
  totalAmountSpend: number;
}

interface DashboardChartRow {
  date: string; // 'YYYY-MM-DD'
  income: number;
  expense: number;
  investment: number;
}

interface ChartsProps {
  categories: DashboardCategory[];
  chartData: DashboardChartRow[];
  typeFilter: 'all' | 'expense' | 'income' | 'investment';
}

export function Charts({ categories, chartData, typeFilter }: ChartsProps) {
  const { currency } = useSettingsStore();

  const {
    expenseByCategory,
    incomeByCategory,
    investmentByCategory,
    expenseTrend,
    incomeTrend,
    investmentTrend,
  } = useMemo(() => {
    const byType = (type: 'expense' | 'income' | 'investment') =>
      categories
        .filter((c) => c.type === type && c.totalAmountSpend > 0)
        .map((c) => ({ name: c.name, value: c.totalAmountSpend, color: c.color }))
        .sort((a, b) => b.value - a.value);

    const buildTrend = (key: 'expense' | 'income' | 'investment') =>
      chartData.map((row) => ({
        name: format(new Date(row.date), 'MMM d'),
        value: row[key],
      }));

    return {
      expenseByCategory: byType('expense'),
      incomeByCategory: byType('income'),
      investmentByCategory: byType('investment'),
      expenseTrend: buildTrend('expense'),
      incomeTrend: buildTrend('income'),
      investmentTrend: buildTrend('investment'),
    };
  }, [categories, chartData]);

  const showExpense = typeFilter === 'all' || typeFilter === 'expense';
  const showIncome = typeFilter === 'all' || typeFilter === 'income';
  const showInvestment = typeFilter === 'all' || typeFilter === 'investment';

  const hasExpenseData = showExpense && (expenseByCategory.length > 0 || expenseTrend.some((d) => d.value > 0));
  const hasIncomeData = showIncome && (incomeByCategory.length > 0 || incomeTrend.some((d) => d.value > 0));
  const hasInvestmentData = showInvestment && (investmentByCategory.length > 0 || investmentTrend.some((d) => d.value > 0));

  // ...rest of the component is unchanged, just gate each section
  // on showExpense / showIncome / showInvestment the same way hasExpenseData etc. already do
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Analytics — This Month</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Expense by Category - Pie */}
        {hasExpenseData && (
          <ChartCard title="Expense by Category" delay={0}>
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {expenseByCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))' }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>
        )}

        {/* Income by Category - Pie */}
        {hasIncomeData && (
          <ChartCard title="Income by Category" delay={0.1}>
            {incomeByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={incomeByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {incomeByCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))' }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>
        )}

        {/* Investment by Category - Pie */}
        {hasInvestmentData && (
          <ChartCard title="Investment by Category" delay={0.2}>
            {investmentByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={investmentByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {investmentByCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))' }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>
        )}

        {/* Expense Trend - Line */}
        {hasExpenseData && (
          <ChartCard title="Expense Trend" delay={0.3}>
            {expenseTrend.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={expenseTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCurrencyShort(v, currency)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>
        )}

        {/* Income Trend - Bar */}
        {hasIncomeData && (
          <ChartCard title="Income Trend" delay={0.4}>
            {incomeTrend.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={incomeTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCurrencyShort(v, currency)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))' }}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  />
                  <Bar dataKey="value" fill="#0284c7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>
        )}

        {/* Investment Trend - Bar */}
        {hasInvestmentData && (
          <ChartCard title="Investment Trend" delay={0.5}>
            {investmentTrend.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={investmentTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => formatCurrencyShort(v, currency)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, currency)}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--popover))' }}
                    cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                  />
                  <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </ChartCard>
        )}
      </div>

      {!hasExpenseData && !hasIncomeData && !hasInvestmentData && (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No transactions to analyze yet</p>
        </div>
      )}
    </div>
  );
}

function ChartCard({ title, delay, children }: { title: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="border-0 p-5 shadow-premium">
        <h3 className="mb-4 text-sm font-semibold">{title}</h3>
        {children}
      </Card>
    </motion.div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[250px] items-center justify-center">
      <p className="text-sm text-muted-foreground">No data for this period</p>
    </div>
  );
}