import { create } from "zustand";

interface DashboardStore {
  refresh: boolean;
  triggerRefresh: () => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  refresh: false,

  triggerRefresh: () =>
    set((state) => ({
      refresh: !state.refresh,
    })),
}));