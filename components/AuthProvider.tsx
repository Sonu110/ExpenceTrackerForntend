"use client";

import { getUsers } from "@/apiFasad/apiCalls/user";
import { useAuthStore } from "@/zustandStore/login";
import { getToken, removeToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader } from "lucide-react";

// Paths that don't require a logged-in user
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

        if (!token) {
          setUser(null);
          setIsAuthenticated(false);
          
          if (!isPublicRoute) {
            router.replace("/login");
          }
          return;
        }

        // If token exists, fetch user details
        const res = await getUsers();

        if (res?.user) {
          setUser(res.user);
          setIsAuthenticated(true);
          
          // If logged in and hitting login page, send to dashboard
          if (isPublicRoute) {
            router.replace("/");
          }
        } else {
          throw new Error("Invalid session");
        }
      } catch (error) {
        await removeToken();
        setUser(null);
        setIsAuthenticated(false);
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.replace("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router, setUser]);

  // 1. Show global spinner during the initial auth token lookup
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  // 2. Prevent rendering any protected dashboard content if not authenticated
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  if (!isAuthenticated && !isPublicRoute) {
    return null; // Stops the dashboard layout components from flashing on page refresh
  }

  return <>{children}</>;
}