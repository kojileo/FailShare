import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isSignedIn: false,
  setUser: (user) => set({ user, isSignedIn: !!user }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: () => set({ user: null, isSignedIn: false }),
})); 