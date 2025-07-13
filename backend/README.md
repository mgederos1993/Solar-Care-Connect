# AI Appointments Backend Service

This backend service handles live notifications for the AI Appointments app, including email and SMS notifications when users subscribe.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

### 3. Get API Keys

#### SendGrid (Email Service)
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key in Settings > API Keys
3. Add the API key to your `.env` file as `SENDGRID_API_KEY`
4. Verify your sender email address in SendGrid

#### Twilio (SMS Service)
1. Sign up at [Twilio](https://twilio.com/)
2. Get your Account SID and Auth Token from the console
3. Purchase a phone number for sending SMS
4. Add these to your `.env` file

### 4. Run the Server

Development:
```bash
npm run dev
```

Production:
```bash
npm start
```

## API Endpoints

### POST /api/notifications/invoice
Sends invoice email to customer
```json
{
  "user": { "name": "...", "email": "...", "company": "..." },
  "plan": { "name": "...", "price": 500, "interval": "monthly" }
}
```

### POST /api/notifications/admin
Sends email and SMS notifications to admin
```json
{
  "user": { "name": "...", "email": "...", "company": "...", "phone": "..." },
  "plan": { "name": "...", "price": 500, "interval": "monthly" },
  "locationPreferences": { "cities": [...], "states": [...] },
  "notificationPreferences": { "email": true, "sms": true }
}
```

### POST /api/notifications/confirmation
Sends confirmation to customer via email/SMS
```json
{
  "user": { "name": "...", "email": "..." },
  "plan": { "name": "...", "price": 500 },
  "notificationPreferences": {
    "email": true,
    "emailAddress": "...",
    "sms": true,
    "phoneNumber": "..."
  }
}
```

## Deployment

### Option 1: Railway
1. Connect your GitHub repo to [Railway](https://railway.app/)
2. Add environment variables in Railway dashboard
3. Deploy automatically

### Option 2: Heroku
1. Install Heroku CLI
2. Create app: `heroku create ai-appointments-backend`
3. Set environment variables: `heroku config:set SENDGRID_API_KEY=...`
4. Deploy: `git push heroku main`

### Option 3: DigitalOcean App Platform
1. Connect GitHub repo to DigitalOcean
2. Configure environment variables
3. Deploy

## Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Helmet security headers
- Input validation
- Error handling

## Testing

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

Test notifications (replace with your backend URL):
```bash
curl -X POST http://localhost:3001/api/notifications/admin \
  -H "Content-Type: application/json" \
  -d '{"user":{"name":"Test User","email":"test@example.com","company":"Test Co","phone":"555-1234"},"plan":{"name":"Professional","price":1800,"interval":"monthly"}}'
```