# Build Instructions for Solar Care Connect

## Quick Deploy to Netlify

### 1. Push to GitHub
```bash
git add .
git commit -m "Fix Netlify deployment with proper build scripts"
git push origin main
```

### 2. Connect to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account and select your repository
4. Netlify will automatically detect the build settings from `netlify.toml`
5. Click **"Deploy site"**

### 3. Access Your App
Your app will be available at: `https://your-site-name.netlify.app`

## What's Fixed

✅ **Missing build:web script**: Added `expo export:web` command
✅ **Node.js version**: Specified Node 20 in multiple config files
✅ **Dependency resolution**: Using `--legacy-peer-deps` flag
✅ **Build configuration**: Proper Expo web build setup
✅ **Static file serving**: Configured for SPA routing

## Local Development

### Build Web Version
```bash
npm run build:web
```

### Test Locally
```bash
npm run serve
```

## Alternative Deployment Options

### GitHub Pages
1. Enable GitHub Pages in your repo settings
2. Use GitHub Actions workflow (already configured)
3. Your app will be at: `https://yourusername.github.io/your-repo-name`

### Vercel
1. Connect your GitHub repo to [vercel.com](https://vercel.com)
2. Vercel will auto-detect the build settings
3. Deploy automatically on every push

## Troubleshooting

**Build fails with dependency errors**:
- The `--legacy-peer-deps` flag should resolve React version conflicts
- Expo will auto-install compatible versions during build

**"Missing script" errors**:
- All required scripts are now in package.json
- `build:web` runs `expo export:web` to create static files

**Node version issues**:
- Node 20 is specified in `.nvmrc`, `.node-version`, and `netlify.toml`
- Netlify will use Node 20 for the build

## Features

- ✅ Works on mobile and desktop browsers
- ✅ Can be installed as PWA (Add to Home Screen)
- ✅ Offline support
- ✅ Responsive design
- ✅ No app store download required
- ✅ Proper build configuration for deployment

Your Solar Care Connect app should now deploy successfully to Netlify! 🚀

## Testing Steps

1. Push code to GitHub
2. Connect repository to Netlify
3. Wait for build to complete (check build logs)
4. Visit your Netlify URL
5. App should load without errors
6. Test on both mobile and desktop browsers