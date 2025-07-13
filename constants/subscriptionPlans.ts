export type SubscriptionPlan = {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  appointmentsPerMonth: number;
  color: string;
  popular?: boolean;
  description?: string;
};

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 500,
    interval: 'monthly',
    features: [
      '5 qualified solar appointments',
      'No-show appointments replaced for free',
      'Basic call analytics',
      'Email notifications',
      'Standard support',
    ],
    appointmentsPerMonth: 5,
    color: '#3B82F6',
    description: 'Perfect for small solar businesses getting started',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 1800,
    interval: 'monthly',
    features: [
      '20 qualified solar appointments',
      'No-show appointments replaced for free',
      'Advanced call analytics',
      'SMS & email notifications',
      'Priority support',
      'Custom AI voice training',
    ],
    appointmentsPerMonth: 20,
    color: '#10B981',
    popular: true,
    description: 'Most popular for growing solar businesses',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 4000,
    interval: 'monthly',
    features: [
      '50 qualified solar appointments',
      'No-show appointments replaced for free',
      'Premium call analytics',
      'Real-time notifications',
      'Dedicated account manager',
      'Custom AI voice training',
      'CRM integration',
      'Team collaboration tools',
    ],
    appointmentsPerMonth: 50,
    color: '#6366F1',
    description: 'For large-scale solar operations',
  },
  {
    id: 'retainer',
    name: 'Retainer',
    price: 2000,
    interval: 'monthly',
    features: [
      'Unlimited qualified solar appointments',
      'No-show appointments replaced for free',
      'Dedicated account manager',
      'Custom AI voice training',
      'Premium analytics & reporting',
      'Priority support',
      'CRM integration',
      'Custom territory mapping',
      'Pay after project installation',
    ],
    appointmentsPerMonth: 999, // Unlimited
    color: '#8B5CF6',
    description: 'Pay monthly retainer, then pay balance after solar project installation',
  },
];