import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import Colors from '@/constants/colors';
import { mockAppointments } from '@/constants/mockAppointments';
import { subscriptionPlans } from '@/constants/subscriptionPlans';
import { useUserStore } from '@/store/userStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import AppointmentCard from '@/components/AppointmentCard';
import SubscriptionCard from '@/components/SubscriptionCard';
import EmptyState from '@/components/EmptyState';
import { Appointment } from '@/types';

export default function AppointmentsScreen() {
  const router = useRouter();
  const { user } = useUserStore();
  const { 
    selectedPlan, 
    isSubscribed, 
    selectPlan 
  } = useSubscriptionStore();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    try {
      if (isSubscribed) {
        setAppointments(mockAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error setting appointments:', error);
      setAppointments([]);
    }
  }, [isSubscribed]);

  const handleAppointmentPress = (appointment: Appointment) => {
    try {
      router.push(`/appointment/${appointment.id}`);
    } catch (error) {
      console.error('Error navigating to appointment:', error);
    }
  };

  const handlePlanSelect = async (planId: string) => {
    try {
      const plan = subscriptionPlans.find(p => p.id === planId);
      if (!plan) return;

      selectPlan(planId);

      // Open JotForm with plan information
      const jotformUrl = `https://form.jotform.com/251608739182059?plan=${encodeURIComponent(plan.name)}&price=${plan.price}&interval=${plan.interval}&appointments=${plan.appointmentsPerMonth}`;
      
      await WebBrowser.openBrowserAsync(jotformUrl);
    } catch (error) {
      console.error('Failed to open JotForm:', error);
    }
  };

  if (!isSubscribed) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose a Subscription</Text>
          <Text style={styles.subtitle}>
            Select a plan to start receiving AI-generated solar appointments
          </Text>
        </View>
        
        <FlatList
          data={subscriptionPlans}
          renderItem={({ item }) => (
            <SubscriptionCard
              plan={item}
              isSelected={selectedPlan?.id === item.id}
              onSelect={() => handlePlanSelect(item.id)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.plansContainer}
        />
        
        <View style={styles.jotformNote}>
          <Text style={styles.jotformNoteText}>
            Clicking "Fill Out Application" will open a form to complete your subscription
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Solar Appointments</Text>
        <Text style={styles.subtitle}>
          AI-generated appointments will appear here
        </Text>
      </View>
      
      <FlatList
        data={appointments}
        renderItem={({ item }) => (
          <AppointmentCard
            appointment={item}
            onPress={handleAppointmentPress}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.appointmentsContainer}
        ListEmptyComponent={
          <EmptyState 
            type="appointments" 
            message="Your AI-generated solar appointments will appear here once we start calling potential customers in your area."
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.light.subtext,
    marginTop: 4,
  },
  appointmentsContainer: {
    padding: 16,
  },
  plansContainer: {
    padding: 16,
  },
  jotformNote: {
    padding: 16,
    paddingTop: 0,
  },
  jotformNoteText: {
    fontSize: 12,
    color: Colors.light.subtext,
    textAlign: 'center',
    fontStyle: 'italic',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
});