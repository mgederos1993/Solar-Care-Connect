import { Platform } from 'react-native';
import { UserProfile } from '../types';
import { SubscriptionPlan } from '../constants/subscriptionPlans';

// Simple notification service - just sends basic notifications
const WEBHOOK_URL = 'https://hook.us1.make.com/your-webhook-url'; // Replace with your Make.com webhook URL

export const sendSubscriptionNotification = async (user: UserProfile, plan: SubscriptionPlan) => {
  try {
    console.log('Sending subscription notification for:', user.name);
    
    const notificationData = {
      type: 'new_subscription',
      timestamp: new Date().toISOString(),
      customer: {
        name: user.name,
        email: user.email,
        company: user.company,
        phone: user.phone
      },
      plan: {
        name: plan.name,
        price: plan.price,
        interval: plan.interval,
        appointments: plan.appointmentsPerMonth === 999 ? 'Unlimited' : plan.appointmentsPerMonth
      },
      message: `New Solar Care Connect subscriber: ${user.name} from ${user.company} subscribed to ${plan.name} plan ($${plan.price}/${plan.interval})`
    };

    // Send to webhook service (Make.com, Zapier, etc.)
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    });

    if (response.ok) {
      console.log('✅ Subscription notification sent successfully');
      return { success: true };
    } else {
      console.error('❌ Failed to send notification:', response.status);
      return { success: false, error: 'Webhook failed' };
    }
  } catch (error) {
    console.error('❌ Notification error:', error);
    
    // Fallback: Log the subscription for manual processing
    console.log('📋 MANUAL NOTIFICATION NEEDED:');
    console.log(`New subscriber: ${user.name} (${user.email})`);
    console.log(`Company: ${user.company}`);
    console.log(`Phone: ${user.phone}`);
    console.log(`Plan: ${plan.name} - $${plan.price}/${plan.interval}`);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
};

// Simple test function
export const testNotificationService = async () => {
  try {
    const testData = {
      type: 'test',
      message: 'Solar Care Connect notification test',
      timestamp: new Date().toISOString()
    };

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    return response.ok;
  } catch (error) {
    console.error('Test notification failed:', error);
    return false;
  }
};