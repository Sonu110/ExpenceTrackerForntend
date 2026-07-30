'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Wallet, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  ShieldCheck, KeyRound, CheckCircle2, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator,
} from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { ForgotPassword, UsergetResetPassword, userGetVerifyOtp } from '@/apiFasad/apiCalls/user';

type Step = 'email' | 'otp' | 'password' | 'done';



export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: send OTP to the user's email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const data ={ email }
      await ForgotPassword(data );
      setStep('otp');
      startResendTimer();
      toast.success('OTP sent successfully', {
        description: `Please check ${email} for the code`,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: verify the code the user received in email
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const data ={ email, otp };
      await userGetVerifyOtp(data );
      setStep('password');
      toast.success('OTP verified successfully');
    } catch (err: any) {
      toast.error(err.message || 'Incorrect OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      const data = {email};
      await ForgotPassword(data);
      startResendTimer();
      toast.success('OTP resent successfully', {
        description: `Please check ${email} for the new code`,
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend OTP.');
    }
  };

  // Step 3: set the new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const data ={ email, otp, password }
      await UsergetResetPassword(data);
      setStep('done');
      toast.success('Password reset successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              <AnimatePresence mode="wait">
                <motion.span
                  key={step}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="block"
                >
                  {step === 'email' && 'Enter your email to receive a code'}
                  {step === 'otp' && `Enter the 6-digit code sent to ${email}`}
                  {step === 'password' && 'Set your new password'}
                  {step === 'done' && 'Your password has been updated'}
                </motion.span>
              </AnimatePresence>
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-premium backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Email */}
            {step === 'email' && (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-primary text-white shadow-glow">
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending OTP...</>
                  ) : (
                    <>Send OTP <ArrowRight className="ml-1 h-4 w-4" /></>
                  )}
                </Button>
              </motion.form>
            )}

            {/* Step 2: OTP */}
            {step === 'otp' && (
              <motion.form
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label>Verification Code</Label>
                  <div className="flex flex-col items-center gap-3 py-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <p className="text-center text-xs text-muted-foreground">
                      Please enter the OTP sent to your Gmail
                    </p>
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={(value) => setOtp(value)}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-12 w-12 text-lg" />
                        <InputOTPSlot index={1} className="h-12 w-12 text-lg" />
                        <InputOTPSlot index={2} className="h-12 w-12 text-lg" />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={3} className="h-12 w-12 text-lg" />
                        <InputOTPSlot index={4} className="h-12 w-12 text-lg" />
                        <InputOTPSlot index={5} className="h-12 w-12 text-lg" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <Button type="submit" disabled={loading || otp.length !== 6} className="w-full gradient-primary text-white shadow-glow">
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...</>
                  ) : (
                    <>Verify OTP <ArrowRight className="ml-1 h-4 w-4" /></>
                  )}
                </Button>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep('email'); setOtp(''); }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0}
                    className="text-xs font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 3: New Password */}
            {step === 'password' && (
              <motion.form
                key="password"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="pl-9 pr-9"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="pl-9"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={loading} className="w-full gradient-primary text-white shadow-glow">
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</>
                  ) : (
                    <>Reset Password <ArrowRight className="ml-1 h-4 w-4" /></>
                  )}
                </Button>
              </motion.form>
            )}

            {/* Step 4: Done */}
            {step === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4 py-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500"
                >
                  <CheckCircle2 className="h-8 w-8" />
                </motion.div>
                <div>
                  <h2 className="text-lg font-semibold">Password Updated!</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your password has been reset successfully. You can now sign in with your new password.
                  </p>
                </div>
                <Link href="/login" className="w-full">
                  <Button className="w-full gradient-primary text-white shadow-glow">
                    Back to Login <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Step indicator */}
        {step !== 'done' && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {(['email', 'otp', 'password'] as Step[]).map((s, i) => {
              const active = step === s;
              const passed = (['email', 'otp', 'password'] as Step[]).indexOf(step) > i;
              return (
                <motion.div
                  key={s}
                  animate={{ width: active ? 32 : 8 }}
                  className="h-2 rounded-full"
                  style={{
                    backgroundColor: active || passed ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                  }}
                />
              );
            })}
          </div>
        )}

        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link href="/login" className="hover:underline">← Back to login</Link>
        </p>
      </motion.div>
    </div>
  );
}