import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { UserProfile } from '@/types';

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  isFirstTime: boolean;
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  setFirstTime: (isFirstTime: boolean) => void;
  logout: () => void;
  clearAll: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isFirstTime: true,
      setUser: (user) => {
        try {
          set({ user, isLoading: false, isFirstTime: false });
        } catch (error) {
          console.error('Error setting user:', error);
        }
      },
      updateUser: (updates) => {
        try {
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          }));
        } catch (error) {
          console.error('Error updating user:', error);
        }
      },
      setFirstTime: (isFirstTime) => {
        try {
          set({ isFirstTime });
        } catch (error) {
          console.error('Error setting first time:', error);
        }
      },
      logout: () => {
        try {
          set({ user: null, isFirstTime: true });
        } catch (error) {
          console.error('Error logging out:', error);
        }
      },
      clearAll: () => {
        try {
          set({ user: null, isFirstTime: true, isLoading: false });
        } catch (error) {
          console.error('Error clearing all:', error);
        }
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log('User store rehydrated:', state?.user?.name || 'No user');
      },
    }
  )
);