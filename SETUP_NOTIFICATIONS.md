# Setting Up Simple Notifications

This guide shows you how to get SMS and email notifications when someone subscribes to Solar Care Connect.

## Option 1: Make.com (Recommended - Free tier available)

### Step 1: Create Make.com Account
1. Go to [make.com](https://make.com) and sign up for free
2. You get 1,000 operations per month for free

### Step 2: Create a New Scenario
1. Click "Create a new scenario"
2. Search for "Webhooks" and select it
3. Choose "Custom webhook"
4. Click "Add" and copy the webhook URL

### Step 3: Add Email Action
1. Click the "+" button after the webhook
2. Search for "Gmail" or "Email" 
3. Choose "Send an email"
4. Connect your Gmail account
5. Set up the email:
   - **To**: Your email address
   - **Subject**: "New Solar Care Connect Subscriber"
   - **Content**: Use the webhook data (customer name, plan, etc.)

### Step 4: Add SMS Action
1. Click the "+" button after the email
2. Search for "SMS" or "Twilio"
3. Choose your SMS service
4. Set up the SMS:
   - **To**: Your phone number
   - **Message**: "New subscriber: {{customer.name}} - {{plan.name}}"

### Step 5: Update the App
1. Copy your webhook URL from Make.com
2. Open `utils/notifications.ts` in your app
3. Replace `WEBHOOK_URL` with your actual webhook URL:
   ```typescript
   const WEBHOOK_URL = 'https://hook.us1.make.com/your-actual-webhook-url';
   ```

### Step 6: Test
1. Save and activate your Make.com scenario
2. Test a subscription in your app
3. You should receive both email and SMS notifications

## Option 2: Zapier (Alternative)

1. Sign up at [zapier.com](https://zapier.com)
2. Create a new Zap with "Webhooks by Zapier" trigger
3. Add Gmail and SMS actions
4. Copy the webhook URL and update your app

## Option 3: Manual Notifications

If you don't want to set up webhooks, the app will log subscription details to the console. You can check these manually:

1. Open your app's development console
2. When someone subscribes, you'll see:
   ```
   📋 MANUAL NOTIFICATION NEEDED:
   New subscriber: John Doe (john@example.com)
   Company: Solar Solutions Inc
   Phone: (555) 123-4567
   Plan: Professional - $1800/monthly
   ```

## What You'll Receive

When someone subscribes, you'll get:

**Email notification with**:
- Customer name and contact info
- Company name
- Selected plan and pricing
- Timestamp

**SMS notification with**:
- Quick summary: "New subscriber: John Doe - Professional plan"

## Cost

- **Make.com**: Free for 1,000 operations/month
- **Zapier**: Free for 100 tasks/month
- **SMS costs**: Varies by provider (usually $0.01-0.05 per SMS)

## Troubleshooting

If notifications aren't working:
1. Check that your webhook URL is correct
2. Make sure your Make.com/Zapier scenario is active
3. Test the webhook directly in Make.com/Zapier
4. Check the app console for error messages

## Need Help?

Contact: solarcareconnect@gmail.com