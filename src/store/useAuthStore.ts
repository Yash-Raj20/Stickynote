import { create } from 'zustand';
import Cookies from 'js-cookie';

interface AuthState {
  user: any | null;
  token: string | null;
  login: (user: any, token: string) => void;
  logout: () => void;
  updateUser: (user: any) => void;
  isAuthenticated: boolean;
}

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('user');
    if (stored) return JSON.parse(stored);
    
    // Fallback: recover ID from JWT token
    const token = Cookies.get('token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { _id: payload.id, name: payload.name, email: payload.email };
    }
    return null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  token: typeof window !== 'undefined' ? Cookies.get('token') || null : null,
  isAuthenticated: typeof window !== 'undefined' ? !!Cookies.get('token') : false,
  login: (user, token) => {
    Cookies.set('token', token, { expires: 7 });
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token, isAuthenticated: true });
  },
  updateUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user });
  },
  logout: () => {
    Cookies.remove('token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
