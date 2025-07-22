import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { LogBox, Platform } from "react-native";

import Colors from "@/constants/colors";
import ErrorBoundary from "@/components/ErrorBoundary";

// Prevent the splash screen from auto-hiding before asset loading is complete.
if (Platform.OS !== 'web') {
  SplashScreen.preventAutoHideAsync().catch(() => {
    // Ignore errors on web
  });
}

// Ignore any specific warnings or logs if needed for debugging
LogBox.ignoreLogs(['Possible Unhandled Promise Rejection']);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  useEffect(() => {
    const hideSplash = async () => {
      try {
        if (Platform.OS !== 'web') {
          await SplashScreen.hideAsync();
        } else {
          // Signal to web that app is ready
          if (typeof window !== 'undefined') {
            console.log('Sending app-ready message');
            // Use setTimeout to ensure message is sent after DOM is ready
            setTimeout(() => {
              window.postMessage('app-ready', '*');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error hiding splash screen:', error);
      }
    };
    
    // Add a longer delay to ensure everything is loaded
    const timer = setTimeout(hideSplash, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerBackTitle: "Back",
              headerStyle: {
                backgroundColor: Colors.light.background,
              },
              headerTintColor: Colors.light.primary,
              headerTitleStyle: {
                fontWeight: '600',
              },
              contentStyle: {
                backgroundColor: Colors.light.background,
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="appointment/[id]" 
              options={{ 
                title: "Appointment Details",
                presentation: "modal",
              }} 
            />
            <Stack.Screen 
              name="settings" 
              options={{ 
                title: "Settings",
              }} 
            />
            <Stack.Screen 
              name="profile" 
              options={{ 
                title: "Edit Profile",
              }} 
            />
          </Stack>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}