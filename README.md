# Solar Care Connect

AI-powered solar appointment generation app that automatically calls potential customers and schedules qualified appointments for solar businesses.

## Features

- **AI-Generated Appointments**: Automated calling system that generates qualified solar leads
- **Subscription Plans**: Multiple tiers from Starter (5 appointments/month) to Unlimited
- **Real-time Notifications**: Get notified when new customers subscribe
- **No-Show Protection**: All no-show appointments are replaced for free
- **Mobile & Web**: Works on iOS, Android, and web browsers

## Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the App
```bash
npm start
```

### 3. Set Up Notifications (Optional)

To receive notifications when customers subscribe, you can use a webhook service like Make.com or Zapier:

1. **Using Make.com (Recommended)**:
   - Sign up at [make.com](https://make.com)
   - Create a new scenario with a webhook trigger
   - Add email and SMS actions
   - Copy the webhook URL
   - Update `WEBHOOK_URL` in `utils/notifications.ts`

2. **Using Zapier**:
   - Sign up at [zapier.com](https://zapier.com)
   - Create a new Zap with webhook trigger
   - Add Gmail and SMS actions
   - Copy the webhook URL
   - Update `WEBHOOK_URL` in `utils/notifications.ts`

### 4. Test Notifications

The app will automatically send notifications when users subscribe. You can test the webhook by subscribing to a plan in the app.

## Subscription Plans

- **Starter**: $500/month - 5 appointments
- **Professional**: $1,800/month - 20 appointments (Most Popular)
- **Enterprise**: $4,000/month - 50 appointments
- **Unlimited**: $6,000/month - Unlimited appointments

## Support

For questions or support, contact: solarcareconnect@gmail.com

## Deployment

The app can be deployed to:
- **Mobile**: Expo Application Services (EAS)
- **Web**: Vercel, Netlify, or any static hosting
- **Notifications**: Make.com, Zapier, or custom webhook service

## Tech Stack

- React Native with Expo
- TypeScript
- Zustand for state management
- Expo Router for navigation
- Lucide React Native for icons