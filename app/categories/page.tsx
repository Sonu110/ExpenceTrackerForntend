"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, TrendingDown, TrendingUp } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DynamicIcon } from "@/components/dynamic-icon";
import { CategoryFormModal } from "@/components/categories/category-form-modal";

import { useSettingsStore } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { Category, TransactionType } from "@/lib/types";

import { getUserCategories } from "@/apiFasad/apiCalls/user";

export default function CategoriesPage() {
  const { currency } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<TransactionType>("expense");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [userCategories, setUserCategories] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const data = await getUserCategories();

      console.log(data);

      setUserCategories(data?.data);
    } catch (error) {
      console.error("Category fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = userCategories.filter((c) => c?.type === activeTab);


  const handleAdd = () => {
    setEditingCategory(null);

    setModalOpen(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);

    setModalOpen(true);
  };

  return (
    <PageContainer
      title="Categories"
      description="Manage your expense and investment categories"
    >
      <div className="space-y-4">
        {/* Tabs */}

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TransactionType)}
        >
          <TabsList className="w-full max-w-xs">
            <TabsTrigger value="expense" className="flex-1 gap-1.5">
              <TrendingDown className="h-4 w-4" />
              Expense
            </TabsTrigger>

            <TabsTrigger value="investment" className="flex-1 gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Investment
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Category Grid */}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredCategories.map((cat, index) => {
              const spent = cat?.totalAmountSpend

              const limit = cat.monthlyBudget;

              const pct = limit ? Math.min((spent / limit) * 100, 100) : 0;

              return (
                <motion.div
                  key={cat._id}
                  layout
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                >
                  <Card
                    className="
                group relative overflow-hidden
                border-0 p-4 shadow-premium
                "
                  >
                    <div
                      className="
                absolute right-0 top-0
                h-24 w-24 rounded-full
                opacity-10 blur-2xl
                "
                      style={{
                        backgroundColor: cat.color,
                      }}
                    />

                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <div
                          className="
                flex h-12 w-12
                items-center justify-center
                rounded-xl
                "
                          style={{
                            backgroundColor: `${cat.color}20`,

                            color: cat.color,
                          }}
                        >
                          <DynamicIcon name={cat.icon} className="h-6 w-6" />
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="
                h-8 w-8
                opacity-100
               
                "
                          onClick={() => handleEdit(cat)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>

                      <h3 className="mt-3 font-semibold">{cat.name}</h3>

                      {cat.Description && (
                        <p
                          className="
                  mt-0.5
                  text-xs
                  text-muted-foreground
                  line-clamp-1
                "
                        >
                          {cat.Description}
                        </p>
                      )}

                      { limit ? (
                        <div className="mt-3">
                          <div
                            className="
                  flex justify-between
                  text-xs
                "
                          >
                            <span className="text-muted-foreground">
                              {formatCurrency(spent, currency)}/
                              {formatCurrency(limit, currency)}
                            </span>

                            <span>{Math.round(pct)}%</span>
                         
                         
                          </div>
                           <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5 }}
                              className={cn(
                                'h-full rounded-full',
                                pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                              )}
                            />
                          </div>
                        </div>
                      ) : (
                        <p
                          className="
                  mt-3
                  text-xs
                  text-muted-foreground
                "
                        >
                          {activeTab === "investment" && !limit
                            ? "Unlimited"
                            : formatCurrency(spent, currency)}
                        </p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredCategories.length === 0 && !loading && (
          <div className="py-16 text-center">
            <p
              className="
              text-sm
              text-muted-foreground
            "
            >
              No {activeTab} categories yet
            </p>
          </div>
        )}
      </div>

      {/* Add Button */}

      <motion.button
        initial={{
          scale: 0,
        }}
        animate={{
          scale: 1,
        }}
        whileTap={{
          scale: 0.9,
        }}
        onClick={handleAdd}
        className="
        fixed bottom-24 right-4
        z-30 flex h-14 w-14
        items-center justify-center
        rounded-full gradient-pay
        shadow-glow
        ring-4 ring-background
        md:bottom-8 md:right-8
        "
      >
        <Plus className="h-6 w-6 text-white" />
      </motion.button>

      <CategoryFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        category={editingCategory}
        type={activeTab}
        existingNames={userCategories?.map((c) => c.name)}
        onSaved={fetchCategories}
      />
    </PageContainer>
  );
}
