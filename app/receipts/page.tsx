'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, X, Search, ImageIcon, Wallet, CreditCard, Smartphone } from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DynamicIcon } from '@/components/dynamic-icon';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useSettingsStore } from '@/lib/store';
import { formatCurrency, formatDate } from '@/lib/format';
import type { PaymentMethod } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getReceipts } from '@/apiFasad/apiCalls/userTransaction';

// Setup interface to strictly type the incoming MongoDB layout safely
interface MongoReceipt {
  _id: string;
  imageUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  transactionId?: {
    _id: string;
    type: 'expense' | 'income' | 'investment';
    title: string;
    amount: number;
    note?: string;
    paymentMethod?: PaymentMethod;
    // Fallbacks if category metadata wasn't populated or nested on transaction endpoint
    category?: { name: string; color: string; icon: string }; 
  };
}

export default function ReceiptsPage() {
  const { currency } = useSettingsStore();
  const [receipts, setReceipts] = useState<MongoReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // 1. Fetch data directly from your populated getReceipts endpoint
  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await getReceipts();
      if (res?.data) {
        setReceipts(res.data);
      }
    } catch (error) {
      console.error("Failed to load receipts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  // 2. Updated Search filtering mapping directly against populated fields
  const filteredReceipts = useMemo(() => {
    if (!search) return receipts;
    const q = search.toLowerCase();
    return receipts.filter((r) => {
      const tx = r.transactionId;
      return (
        tx?.title?.toLowerCase().includes(q) ||
        tx?.type?.toLowerCase().includes(q) ||
        formatDate(r.createdAt).toLowerCase().includes(q)
      );
    });
  }, [receipts, search]);

  const previewTx = previewIndex !== null ? filteredReceipts[previewIndex] : null;
  console.log(previewTx);
  

  const handlePrev = () => {
    setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredReceipts.length - 1));
  };

  const handleNext = () => {
    setPreviewIndex((prev) => (prev !== null && prev < filteredReceipts.length - 1 ? prev + 1 : 0));
  };

  if (loading) {
    return (
      <PageContainer title="Receipts" description="View all your uploaded bill receipts">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Receipts" description="View all your uploaded bill receipts">
      {filteredReceipts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-0 py-20 shadow-premium">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium">No receipts found</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload a receipt image when adding a transaction to see it here
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search receipts..."
              className="pl-9"
            />
          </div>

          {/* Gallery grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence>
              {filteredReceipts.map((r, i) => {
                const tx = r.transactionId;
                return (
                  <motion.div
                    key={r._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -4 }}
                    onClick={() => setPreviewIndex(i)}
                    className="group cursor-pointer"
                  >
                    <Card className="overflow-hidden border-0 shadow-premium">
                      {/* Receipt image */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <img
                         src={`${process.env.NEXT_PUBLIC_API_URL!}${r.imageUrl}`}
                          alt={tx?.title || "Receipt"}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        
                        {/* Type badge */}
                        {tx?.type && (
                          <div className="absolute right-2 top-2">
                            <Badge
                              variant={tx.type === 'expense' ? 'destructive' : 'default'}
                              className="capitalize"
                            >
                              {tx.type}
                            </Badge>
                          </div>
                        )}

                        {/* Overlay info */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <p className="truncate text-sm font-semibold">{tx?.title || 'Unnamed Transaction'}</p>
                          {tx?.category && (
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <div
                                className="flex h-5 w-5 items-center justify-center rounded"
                                style={{ backgroundColor: `${tx.category.color}40` }}
                              >
                                <DynamicIcon name={tx.category.icon} className="h-3 w-3" />
                              </div>
                              <span className="text-xs opacity-90">{tx.category.name}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-2">
                          <PaymentMethodIcon method={tx?.paymentMethod || 'cash'} />
                          <span className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</span>
                        </div>
                        <span
                          className={cn(
                            'text-sm font-semibold',
                            tx?.type === 'expense' ? 'text-red-500' : 'text-green-500'
                          )}
                        >
                          {formatCurrency(Number(tx?.amount || 0), currency)}
                        </span>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Lightbox preview */}
      <Dialog open={previewIndex !== null} onOpenChange={(open) => !open && setPreviewIndex(null)}>
        <DialogContent className="max-w-2xl overflow-hidden p-0">
          <DialogTitle className="sr-only">Receipt preview</DialogTitle>
          {previewTx && (
            <div>
              <div className="relative max-h-[70vh] overflow-hidden flex justify-center bg-black/5">
                <img
                 src={`${process.env.NEXT_PUBLIC_API_URL!}${previewTx.imageUrl}`}
                  alt={previewTx.transactionId?.title || "Receipt"}
                  className="w-full object-contain max-h-[70vh]"
                />
                <button
                  onClick={() => setPreviewIndex(null)}
                  className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80"
                >
                  <X className="h-5 w-5" />
                </button>
                {filteredReceipts.length > 1 && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </>
                )}
              </div>
              
              {/* Details structure */}
              <div className="space-y-3 p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {previewTx.transactionId?.category && (
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ 
                          backgroundColor: `${previewTx.transactionId.category.color}20`, 
                          color: previewTx.transactionId.category.color 
                        }}
                      >
                        <DynamicIcon name={previewTx.transactionId.category.icon} className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{previewTx.transactionId?.title || 'Unnamed Entry'}</p>
                      <p className="text-xs text-muted-foreground">{previewTx.transactionId?.category?.name || 'No category'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-lg font-bold', previewTx.transactionId?.type === 'expense' ? 'text-red-500' : 'text-green-500')}>
                      {formatCurrency(Number(previewTx.transactionId?.amount || 0), currency)}
                    </p>
                    <Badge variant="outline" className="mt-1 capitalize">{previewTx.transactionId?.type || 'expense'}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-border pt-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Date Uploaded</p>
                    <p className="font-medium">{formatDate(previewTx.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">File Size</p>
                    <p className="font-medium">{(previewTx.fileSize / 1024).toFixed(1)} KB</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Payment Method</p>
                    <div className="flex items-center gap-1.5 font-medium">
                      <PaymentMethodIcon method={previewTx.transactionId?.paymentMethod || 'cash'} />
                      <span className="capitalize">{previewTx.transactionId?.paymentMethod || 'cash'}</span>
                    </div>
                  </div>
                </div>
                {previewTx.transactionId?.note && (
                  <div className="border-t border-border pt-3">
                    <p className="text-xs text-muted-foreground">Notes</p>
                    <p className="mt-0.5 text-sm">{previewTx.transactionId.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

function PaymentMethodIcon({ method }: { method: PaymentMethod }) {
  const Icon = method === 'cash' ? Wallet : method === 'card' ? CreditCard : Smartphone;
  const cls =
    method === 'cash'
      ? 'text-amber-600'
      : method === 'card'
        ? 'text-blue-600'
        : 'text-violet-600';
  return <Icon className={cn('h-4 w-4', cls)} />;
}