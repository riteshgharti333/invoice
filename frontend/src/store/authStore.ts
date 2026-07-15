import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { authApi } from "../features/api/auth.api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<{ message: string; data: { user: User } }>;
  logout: () => Promise<{ message: string }>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const data = await authApi.login(email, password);
          set({
            user: data.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
          return data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const data = await authApi.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          return data;
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
          throw error;
        }
      },

      checkAuth: async () => {
        try {
          const data = await authApi.me();
          set({
            user: data.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
    }),
    { name: "AuthStore" },
  ),
);
