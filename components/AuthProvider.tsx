"use client";

import { getUsers } from "@/apiFasad/apiCalls/user";
import { useAuthStore } from "@/zustandStore/login";
import { getToken, removeToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Check token exists

        const token = await getToken();
        

        if (!token) {
          router.push("/login");

          return;
        }

        // 2. Get user from backend

        const res = await getUsers();

        if (res?.user) {
          setUser(res?.user);
        } else {
          throw new Error("User not found");
        }
      } catch (error) {
        // token invalid or expired

        await removeToken();

        setUser(null);

        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
