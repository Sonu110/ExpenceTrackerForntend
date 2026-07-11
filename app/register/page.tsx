"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Wallet,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ArrowRight,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { registerUser } from "@/apiFasad/authApiCall";
import { useAuthStore } from "@/zustandStore/login";

export default function RegisterPage() {
  const router = useRouter();
 const setUser = useAuthStore((s) => s.setUser);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    monthlyBudget: "",
    currency: "INR",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Please fill all required fields");

      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");

      return;
    }

    try {
      setLoading(true);

      const payload = {
        username: formData.username,

        email: formData.email,

        password: formData.password,

        monthlyBudget: Number(formData.monthlyBudget) || 0,

        currency: formData.currency,

        profileImage: null,
      };

      const data = await registerUser(payload);
         setUser(data?.user)

      localStorage.setItem("token", data?.token);

      toast.success("Account created successfully");

      router.push("/");
    } catch (error: any) {
      toast.error(error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4 py-8">
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
        }}
        className="w-full max-w-md"
      >
        {/* Logo */}

        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary shadow-glow">
            <Wallet className="h-7 w-7 text-white" />
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold">Create account</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Start tracking your finances today
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-premium backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}

            <div className="space-y-1.5">
              <Label>Username</Label>

              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Email */}

            <div className="space-y-1.5">
              <Label>Email</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Monthly Budget */}

            <div className="space-y-1.5">
              <Label>Monthly Budget</Label>

              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="monthlyBudget"
                  type="number"
                  value={formData.monthlyBudget}
                  onChange={handleChange}
                  placeholder="50000"
                  className="pl-9"
                />
              </div>
            </div>

            {/* Currency */}

            <div className="space-y-1.5">
              <Label>Currency</Label>

              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="INR">INR - Indian Rupee</option>

                <option value="USD">USD - Dollar</option>

                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            {/* Password */}

            <div className="space-y-1.5">
              <Label>Password</Label>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="pl-9 pr-9"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full gradient-primary text-white shadow-glow"
            >
              {loading ? "Creating account..." : "Create Account"}

              {!loading && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?
            <Link
              href="/login"
              className="ml-1 font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
