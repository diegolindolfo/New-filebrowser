import { create } from "zustand";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  isNoAuth: boolean;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  setNoAuth: (v: boolean) => void;
  setAuthenticated: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isNoAuth: false,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setNoAuth: (isNoAuth) => set({ isNoAuth }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
