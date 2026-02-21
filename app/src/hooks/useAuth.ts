import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'teacher' | 'admin';
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'student' | 'teacher';
}

const API_URL = 'http://localhost:8000/api';

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const formData = new URLSearchParams();
          formData.append('username', email);
          formData.append('password', password);

          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
          });

          if (!response.ok) {
            const error = await response.json();
            return { success: false, error: error.detail || 'Login failed' };
          }

          const data = await response.json();
          
          // Get user info
          const userResponse = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${data.access_token}`,
            },
          });

          if (userResponse.ok) {
            const user = await userResponse.json();
            set({ user, token: data.access_token, isAuthenticated: true });
            return { success: true };
          }
          
          return { success: false, error: 'Failed to get user info' };
        } catch (error) {
          return { success: false, error: 'Network error' };
        }
      },

      register: async (data: RegisterData) => {
        try {
          const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const error = await response.json();
            return { success: false, error: error.detail || 'Registration failed' };
          }

          await response.json();
          
          // Auto login after registration
          const loginResult = await get().login(data.email, data.password);
          return loginResult;
        } catch (error) {
          return { success: false, error: 'Network error' };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
