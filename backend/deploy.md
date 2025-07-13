# Deployment Guide

## Quick Deploy to Railway (Recommended)

1. **Sign up for Railway**: Go to [railway.app](https://railway.app) and sign up with GitHub

2. **Deploy from GitHub**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect it's a Node.js app

3. **Set Environment Variables**:
   In Railway dashboard, go to your project → Variables tab and add:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ADMIN_EMAIL=solarcareconnect@gmail.com
   ADMIN_PHONE=+17024085207
   FROM_EMAIL=noreply@aiappointments.com
   ```

4. **Get Your API Keys**:

   **SendGrid (Free tier available)**:
   - Sign up at [sendgrid.com](https://sendgrid.com)
   - Go to Settings → API Keys → Create API Key
   - Choose "Full Access" and copy the key
   - Verify your sender email in Settings → Sender Authentication

   **Twilio (Free trial with $15 credit)**:
   - Sign up at [twilio.com](https://twilio.com)
   - Get Account SID and Auth Token from Console Dashboard
   - Buy a phone number in Console → Phone Numbers → Manage → Buy a number
   - Use the format +1234567890 for TWILIO_PHONE_NUMBER

5. **Update React Native App**:
   In `utils/notifications.ts`, replace the backend URL:
   ```typescript
   const API_BASE_URL = __DEV__ 
     ? 'http://localhost:3001' 
     : 'https://your-app-name.up.railway.app'; // Your Railway URL
   ```

6. **Test the Setup**:
   - Deploy and get your Railway URL
   - Test the health endpoint: `https://your-app-name.up.railway.app/health`
   - Try a subscription in your app

## Alternative: Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create ai-appointments-backend`
4. Set environment variables:
   ```bash
   heroku config:set SENDGRID_API_KEY=your_key
   heroku config:set TWILIO_ACCOUNT_SID=your_sid
   heroku config:set TWILIO_AUTH_TOKEN=your_token
   heroku config:set TWILIO_PHONE_NUMBER=your_number
   heroku config:set ADMIN_EMAIL=solarcareconnect@gmail.com
   heroku config:set ADMIN_PHONE=+17024085207
   ```
5. Deploy: `git push heroku main`

## Cost Breakdown

**Free Tier Options**:
- Railway: Free tier with 500 hours/month
- SendGrid: 100 emails/day free
- Twilio: $15 free trial credit

**Paid (if needed)**:
- Railway: $5/month for hobby plan
- SendGrid: $14.95/month for 40k emails
- Twilio: ~$1/month for phone number + $0.0075 per SMS

## Testing

Once deployed, test with:
```bash
curl https://your-backend-url.com/health
```

Should return:
```json
{"status":"OK","timestamp":"2025-01-13T..."}
```