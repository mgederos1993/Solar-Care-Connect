import { Appointment } from '../constants/mockAppointments';
import { SubscriptionPlan } from '../constants/subscriptionPlans';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  avatar?: string;
  subscriptionId?: string;
  appointmentsRemaining: number;
};

export type { Appointment, SubscriptionPlan };