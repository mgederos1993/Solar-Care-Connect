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

### 3. Build for Web
```bash
npm run build:web
npm run postbuild
```

This creates a `dist/` folder with the static files for your web app.

### 4. Deploy to GitHub Pages

1. Push your code to a GitHub repository
2. Go to Settings > Pages in your GitHub repo
3. Select "GitHub Actions" as the source
4. The app will automatically deploy when you push to the main branch

Your app will be available at: `https://yourusername.github.io/your-repo-name`

## Subscription Plans

- **Starter**: $500/month - 5 appointments
- **Professional**: $1,800/month - 20 appointments (Most Popular)
- **Enterprise**: $4,000/month - 50 appointments
- **Unlimited**: $6,000/month - Unlimited appointments

## Support

For questions or support, contact: solarcareconnect@gmail.com

## Tech Stack

- React Native with Expo
- TypeScript
- Zustand for state management
- Expo Router for navigation
- Lucide React Native for icons
- GitHub Pages for deployment

## Deployment Options

- **GitHub Pages**: Free static hosting (recommended)
- **Netlify**: Drag and drop the `dist/` folder
- **Vercel**: Connect your GitHub repo
- **Expo Hosting**: Run `expo publish:web`

## Troubleshooting

If you encounter deployment issues:

1. Make sure all dependencies are installed: `npm install`
2. Check that the build completes without errors: `npm run build:web`
3. Verify the `dist/` folder contains an `index.html` file
4. Check the browser console for any JavaScript errors
5. Ensure your GitHub Pages settings are configured correctly

## Progressive Web App (PWA)

The app includes PWA features:
- Add to home screen on mobile devices
- Offline functionality
- App-like experience in browsers

Users can install it directly from their browser without visiting an app store.