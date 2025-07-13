import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { subscriptionPlans } from '@/constants/subscriptionPlans';
import { SubscriptionPlan } from '@/types';

export type LocationPreferences = {
  cities: string[];
  states: string[];
  zipCodes: string[];
  counties: string[];
};

export type NotificationPreferences = {
  email: boolean;
  sms: boolean;
  emailAddress?: string;
  phoneNumber?: string;
};

interface SubscriptionState {
  selectedPlan: SubscriptionPlan | null;
  isSubscribed: boolean;
  locationPreferences: LocationPreferences | null;
  notificationPreferences: NotificationPreferences;
  selectPlan: (planId: string) => void;
  setLocationPreferences: (preferences: LocationPreferences) => void;
  setNotificationPreferences: (preferences: NotificationPreferences) => void;
  subscribe: () => void;
  cancelSubscription: () => void;
  clearAll: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      selectedPlan: null,
      isSubscribed: false,
      locationPreferences: null,
      notificationPreferences: {
        email: true,
        sms: true,
      },
      selectPlan: (planId) => {
        try {
          const plan = subscriptionPlans.find((plan) => plan.id === planId);
          set({ selectedPlan: plan || null });
        } catch (error) {
          console.error('Error selecting plan:', error);
        }
      },
      setLocationPreferences: (preferences) => {
        try {
          set({ locationPreferences: preferences });
        } catch (error) {
          console.error('Error setting location preferences:', error);
        }
      },
      setNotificationPreferences: (preferences) => {
        try {
          set({ notificationPreferences: preferences });
        } catch (error) {
          console.error('Error setting notification preferences:', error);
        }
      },
      subscribe: () => {
        try {
          set({ isSubscribed: true });
        } catch (error) {
          console.error('Error subscribing:', error);
        }
      },
      cancelSubscription: () => {
        try {
          set({ 
            isSubscribed: false, 
            locationPreferences: null,
            selectedPlan: null,
          });
        } catch (error) {
          console.error('Error cancelling subscription:', error);
        }
      },
      clearAll: () => {
        try {
          set({
            selectedPlan: null,
            isSubscribed: false,
            locationPreferences: null,
            notificationPreferences: {
              email: true,
              sms: true,
            },
          });
        } catch (error) {
          console.error('Error clearing subscription data:', error);
        }
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log('Subscription store rehydrated:', state?.selectedPlan?.name || 'No plan');
      },
    }
  )
);