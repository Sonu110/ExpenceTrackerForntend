'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import {
  User, DollarSign, Moon, Sun, Bell, Download, DatabaseBackup,
  RotateCcw, Info, Mail, Check, LogOut, Pencil, Loader2, Wallet,
  type LucideIcon,
} from 'lucide-react';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useSettingsStore } from '@/lib/store';
import { CURRENCIES } from '@/lib/types';
import { dummyStore } from '@/lib/dummy-store';
import { useAllData } from '@/hooks/use-data';
import { dummyCategories } from '@/data/categories';
import { dummyTransactions } from '@/data/transactions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuthStore } from '@/zustandStore/login';
import { updateUser } from '@/apiFasad/apiCalls/user';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const settings = useSettingsStore();
  const { transactions, categories, refetch } = useAllData();
  const [mounted, setMounted] = useState(false);

  // Pull the logged-in user and (assumed) setter from the auth store.
  // Rename `setUser` here if your store's action has a different name.
  const user = useAuthStore((e) => e.user);
  const setUser = useAuthStore((e: any) => e.setUser);

  // Edit-mode state for the Profile section
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    username: '',
    email: '',
    currency: 'INR',
    monthlyBudget: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Populate the form whenever the user data becomes available / changes
  useEffect(() => {
    if (user) {
      setForm({
        username: user.username ?? '',
        email: user.email ?? '',
        currency: user.currency ?? 'INR',
        monthlyBudget: user.monthlyBudget ?? 0,
      });
    }
  }, [user]);

  const handleFieldChange = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    // Revert any unsaved changes back to the last known user data
    if (user) {
      setForm({
        username: user.username ?? '',
        email: user.email ?? '',
        currency: user.currency ?? 'INR',
        monthlyBudget: user.monthlyBudget ?? 0,
      });
    }
    setIsEditing(false);
  };

  const handleUpdateProfile = async () => {
    if (!user?._id) {
      toast.error('No user found to update');
      return;
    }

    setIsSaving(true);
    try {
      // NOTE: adjust the URL/base path and headers (e.g. Authorization token)
      // to match however your app talks to the backend.
      const payload = {
          _id: user._id,
          username: form.username,
          email: form.email,
          currency: form.currency,
          monthlyBudget: Number(form.monthlyBudget),
        }
      
      const res = await updateUser(payload)


      // Keep the local settings store's currency in sync too
      settings.setCurrency(form.currency);

      // Update the cached user in the auth store, if a setter exists
      setUser?.(res?.user ?? { ...user, ...form });

      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Item', 'Amount', 'Status', 'Notes'];
    const rows = transactions.map((t) => [
      t.date,
      t.type,
      t.category.name,
      t.item_name,
      String(t.amount),
      t.status,
      t.notes || '',
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported to CSV');
  };

  const handleBackup = async () => {
    const backup = { categories, transactions, settings: { currency: settings.currency }, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Backup downloaded');
  };

  const handleReset = () => {
    dummyStore.resetAll(dummyCategories, dummyTransactions);
    settings.resetSettings();
    refetch();
    toast.success('Application reset');
  };

  const handleLogout = () => {
    settings.resetSettings();
    localStorage.removeItem('token')
    router.push('/login');
    toast.success('Logged out successfully');
  };

  return (
    <PageContainer title="Settings" description="Manage your preferences and data">
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Profile */}
        <SettingsSection
          icon={User}
          title="Profile"
          delay={0}
          action={
            !isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-1.5">
                <Button
                  size="sm"
                  className="h-8 gap-1.5 px-2.5 text-xs"
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save'
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
              </div>
            )
          }
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={form.username}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('username', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  disabled={!isEditing}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Monthly Budget */}
        <SettingsSection icon={Wallet} title="Monthly Budget" delay={0.03}>
          <div className="space-y-1.5">
            <Label htmlFor="monthlyBudget">Set your monthly budget</Label>
            <div className="relative">
               < div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" >
              {CURRENCIES.find((e) => e.code === form.currency)?.symbol}
              </div>
              <Input
                id="monthlyBudget"
                type="number"
                min={0}
                value={form.monthlyBudget}
                disabled={!isEditing}
                onChange={(e) => handleFieldChange('monthlyBudget', Number(e.target.value))}
                className="pl-9"
                placeholder="e.g. 10000"
              />
            </div>
            {!isEditing && (
              <p className="text-xs text-muted-foreground">
                Click Edit in the Profile section above to change this.
              </p>
            )}
          </div>
        </SettingsSection>

        {/* Currency */}
        <SettingsSection icon={DollarSign} title="Currency" delay={0.05}>
          <div className="space-y-1.5">
            <Label>Select your preferred currency</Label>
            <Select
              value={form.currency}
              disabled={!isEditing}
              onValueChange={(val) => handleFieldChange('currency', val)}
            >
              <SelectTrigger disabled={!isEditing}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.symbol} {c.label} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isEditing && (
              <p className="text-xs text-muted-foreground">
                Click Edit in the Profile section above to change this.
              </p>
            )}
          </div>
        </SettingsSection>

        {/* Theme */}
        <SettingsSection icon={theme === 'dark' ? Moon : Sun} title="Appearance" delay={0.1}>
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Check },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                    mounted && theme === opt.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:bg-accent'
                  )}
                >
                  <opt.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection icon={Bell} title="Notifications" delay={0.15}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Budget alerts</p>
              <p className="text-xs text-muted-foreground">Get notified when approaching budget limits</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={settings.setNotifications}
            />
          </div>
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection icon={DatabaseBackup} title="Data Management" delay={0.2}>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              Export Data (CSV)
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleBackup}>
              <DatabaseBackup className="mr-2 h-4 w-4" />
              Backup Database
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-500">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Application
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset application?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your categories and transactions. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleReset} className="bg-red-500 hover:bg-red-600">
                    Reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </SettingsSection>

        {/* About */}
        <SettingsSection icon={Info} title="About" delay={0.25}>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">App</span>
              <span className="font-medium">FinTrack</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Built with</span>
              <span className="font-medium">Next.js</span>
            </div>
          </div>
        </SettingsSection>

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Button
            variant="outline"
            className="w-full justify-center border-red-200 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-900/50"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </motion.div>
      </div>
    </PageContainer>
  );
}

function SettingsSection({
  icon: Icon,
  title,
  delay,
  action,
  children,
}: {
  icon: LucideIcon;
  title: string;
  delay: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      <Card className="border-0 p-5 shadow-premium">
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-semibold">{title}</h2>
          </div>
          {action}
        </div>
        {children}
      </Card>
    </motion.div>
  );
}