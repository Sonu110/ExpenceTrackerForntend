
import { loginOutUser } from "@/apiFasad/authApiCall";
import { create } from "zustand";

type User = {
  _id(arg0: string, _id: any): unknown;
  id: string;
  username: string;
};

type AuthState = {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: async () => {
    await loginOutUser();
    set({ user: null });
  },
}));
